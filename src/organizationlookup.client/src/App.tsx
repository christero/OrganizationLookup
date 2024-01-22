import { useState, ChangeEvent } from 'react';
import * as Papa from 'papaparse';
import './App.css';
import { OrgLookupRequest, OrgLookupResult } from './interfaces/orgLookupInterfaces';
import OrganizationLookupService from './services/OrganizationLookupService';
import FileService from './services/fileService';



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
    const [orgLookupResults, setOrgLookupResult] = useState<OrgLookupResult | null>(null);

    async function handleFileChanged(event: ChangeEvent<HTMLInputElement>) {
        try {
            const selectedFile = event.currentTarget.files?.[0];
            if (selectedFile) {
                setIsProcessing(true);
                setOrgLookupResult(null);

                const fileContent = await FileService.readCSVFile(selectedFile);

                const newInputData = await parseCSVData(fileContent);

                setInputLookupData(newInputData);
            }
        } catch (error) {
            console.error('Error handling file change:', error);
        } finally {
            setIsProcessing(false);
        }
    }

    async function parseCSVData(fileContent: string): Promise<InputOrganizations> {
        return new Promise<InputOrganizations>((resolve) => {
            Papa.parse<InputOrganization>(fileContent, {
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
                complete: (result) => {
                    const newInputData: InputOrganizations = {
                        organizations: result.data
                    };
                    resolve(newInputData);
                },
            });
        });
    }

    async function handleLookupClick() {
        setIsProcessing(true);

        const orgLookupRequest: OrgLookupRequest = {
            organizations: inputLookupData.organizations.map(org => ({ orgNumber: org.OrgNo })),
        };

        try {
            const orgLookupResult = await OrganizationLookupService.performLookup(orgLookupRequest);
            if (orgLookupResult) {
                const organizationsDetails = orgLookupResult.organizations.map(org => ({
                    ...org,
                    name: inputLookupData.organizations.find(inputOrg => inputOrg.OrgNo === org.orgNumber)?.Name || '',
                }));

                const result: OrgLookupResult = {
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
    }

    function handleDownloadCSVFileClick(): void {
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

        FileService.downloadFile('resultat.csv', csvContent, 'text/csv');
    }

    function handleDownloadErrorFileClick(): void {
        if (!orgLookupResults || !orgLookupResults.errors || orgLookupResults.errors === '') {
            return;
        }

        FileService.downloadFile('feillogg.txt', orgLookupResults.errors, 'text/plain');
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
                        <button onClick={handleDownloadCSVFileClick}>Last ned ny CSV-fil</button>

                        {orgLookupResults.errors && orgLookupResults.errors !== '' && (
                            <button onClick={handleDownloadErrorFileClick}>Last ned feil-logg</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


export default App;