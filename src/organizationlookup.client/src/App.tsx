import { useState, ChangeEvent } from 'react';
import * as Papa from 'papaparse';
import './App.css';
import { IOrganization } from './interfaces/OrganizationDetails';
import { IOrgLookupRequest, IOrgLookup } from './interfaces/OrgLookupRequest';

interface LookupResult {
    organizations: IOrganization[];
    errors: string;
}

interface InputOrganizations {
    organizations: InputOrganization[];
}

interface InputOrganization {
    OrgNo: string;
    Name: string;
}

function App() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputLookupData, setInputLookupData] = useState<InputOrganizations>({ organizations: [] });
    const [orgLookupResults, setOrgLookupResult] = useState<LookupResult | null>(null);

    async function handleFileChanged(event: ChangeEvent<HTMLInputElement>) {
        try {
            const selectedFile = event.currentTarget.files?.[0];
            if (selectedFile) {
                setIsProcessing(true);
                setOrgLookupResult(null);

                const fileContent = await readCSVFile(selectedFile);

                const newInputData = parseCSVData(fileContent);
                setInputLookupData(newInputData);
            }
        } catch (error) {
            console.error('Error handling file change:', error);
        } finally {
            setIsProcessing(false);
        }
    }

    const readCSVFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target) {
                    resolve(event.target.result as string);
                }
            };
            reader.readAsText(file);
        });
    };

    const parseCSVData = (fileContent: string): InputOrganizations => {
        const parsedData = Papa.parse<InputOrganization>(fileContent, {
            delimiter: ';',
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.replace(/,+$/, ''),
            transform: (value: string, header: string) => {
                if (header === 'Name') {
                    return value.replace(/,+$/, '');
                }

                return value;
            },
        });

        const newInputData: InputOrganizations = {
            organizations: parsedData.data
        };

        return newInputData;
    };

    const handleLookupClick = async () => {
        setIsProcessing(true);

        const orgLookupRequest: IOrgLookupRequest = {
            organizations: inputLookupData.organizations.map(org => ({ orgNumber: org.OrgNo })),
        };

        try {
            const orgLookupResult = await sendPostRequest(orgLookupRequest);
            if (orgLookupResult) {
                const organizationsDetails = orgLookupResult.organizations.map(org => ({
                    ...org,
                    name: inputLookupData.organizations.find(inputOrg => inputOrg.OrgNo === org.orgNumber)?.Name || '',
                }));

                const result: LookupResult = {
                    organizations: organizationsDetails,
                    errors: orgLookupResult.errors
                };

                setOrgLookupResult(result);
                setInputLookupData({ organizations: [] });
            }
        } catch (error) {
            console.error('An error occurred during lookup:', error);
        }
        finally {
            setIsProcessing(false);
        }
    };


    const sendPostRequest = async (orgLookupRequest: IOrgLookupRequest) => {
        try {
            ////////////////////////////////////temp
            const hardcodedOrgRequest: IOrgLookup = {
                orgNumber: '811583332', // Legg til ønsket organisasjonsnummer her
            };

            const hardcodedOrgRequest3: IOrgLookup = {
                orgNumber: '9803655', // Legg til ønsket organisasjonsnummer her
            };


            const orglookuprequest2: IOrgLookupRequest = {
                organizations: [hardcodedOrgRequest, hardcodedOrgRequest3] //, hardcodedOrgRequest3, hardcodedOrgRequest4],
            };

            //     orgLookupRequest = orglookuprequest2;
            ///////////////////////////////////
            console.log('bodydata orgLookupRequest:', orgLookupRequest);
            const response = await fetch('https://localhost:7259/api/Organizations/lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orgLookupRequest),
            });

            if (response.ok) {
                //const responseData: LookupResult[] = await response.json();
                const responseData: LookupResult = await response.json();
                console.log('Response data:', responseData);
                return responseData;
            } else {
                console.error('HTTP error:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('An error occurred during the HTTP request:', error);
        }
    };

    function handleDownloadCSVFile(): void {
        if (!orgLookupResults || orgLookupResults.organizations.length === 0) {
            return;
        }

        const csvHeader = ['OrgNo', 'Name', 'BrregNavn', 'AntallAnsatte', 'Naeringskode', 'Organisasjonsform', 'Konkurs', 'Slettet'];

        const csvData = orgLookupResults.organizations.map(org => ({
            OrgNo: org.orgNumber,
            Name: org.name,
            BrregNavn: org.brregName || '',
            AntallAnsatte: org.numberOfEmployees?.toString() || '',
            Naeringskode: org.businessCategoryCode || '',
            Organisasjonsform: org.legalStructureCode || '',
            Konkurs: org.isBankrupt ? 'Ja' : 'Nei' || '',
            Slettet: org.isDeleted ? 'Ja' : 'Nei' || ''
        }));

        const csvContent = Papa.unparse({ fields: csvHeader, data: csvData }, { delimiter: ';' });

        downloadFile('resultat.csv', csvContent, 'text/csv');
    }

    function handleDownloadErrorFile(): void {
        if (!orgLookupResults || !orgLookupResults.errors || orgLookupResults.errors === '') {
            return;
        }

        downloadFile('feillogg.txt', orgLookupResults.errors, 'text/plain');
    }

    function downloadFile(fileName: string, content: string, fileType: string) {
        const blob = new Blob([content], { type: fileType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    }

    return (
        <div>
            <h1 id="tabelLabel">Brønnøysundregisteret</h1>

            {isProcessing && <p>Processing...</p>}

            <input type="file" accept=".csv" onChange={handleFileChanged} disabled={isProcessing} />
            <button onClick={handleLookupClick} disabled={isProcessing || !inputLookupData.organizations.length}>
                Slå opp i Brønnøysundregisteret
            </button>

            {orgLookupResults !== null && (
                <div>
                    <h2>Resultater</h2>
                    <div>
                        <button onClick={handleDownloadCSVFile}>Last ned ny CSV-fil</button>

                        {orgLookupResults.errors && orgLookupResults.errors !== '' && (
                            <button onClick={handleDownloadErrorFile}>Last ned feil-logg</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


export default App;