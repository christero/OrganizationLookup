import Papa from "papaparse";
import { Organization } from "../interfaces/organization";
import { ChangeEvent, useState } from "react";
import FileService from "../services/FileService";

interface OrganizationStats {
    totalOrgs: number;
    enk: number;
    notEnk: number;
    asWithEmployees0To4: number;
    asWithEmployees5To10: number;
    asWithEmployeesGreaterThan10: number;
}

function OrgAnalysisComponent() {
    const [inputData, setInputData] = useState<Organization[]>([]);
    const [stats, setStats] = useState<OrganizationStats>({
        totalOrgs: 0,
        enk: 0,
        notEnk: 0,
        asWithEmployees0To4: 0,
        asWithEmployees5To10: 0,
        asWithEmployeesGreaterThan10: 0,
    });

    async function handleInputFileChanged(event: ChangeEvent<HTMLInputElement>) {
        try {
            const selectedFile = event.currentTarget.files?.[0];
            if (selectedFile) {
                setInputData([]);

                const fileContent = await FileService.readCSVFile(selectedFile);

                const inputData = await parseCSVData(fileContent);

                setInputData(inputData);
                calculateStatistics(inputData);
            }
        } catch (error) {
            console.error('Error handling file change:', error);

        }
    }

    async function parseCSVData(fileContent: string): Promise<Organization[]> {
        return new Promise<Organization[]>((resolve) => {
            Papa.parse(fileContent, {
                delimiter: ';',
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    const inputData: Organization[] = result.data.map((row: any) => {
                        return {
                            orgNumber: row.OrgNo,
                            name: row.Name,
                            brregName: row.BrregNavn,
                            numberOfEmployees: row.AntallAnsatte,
                            businessCategoryCode: row.Naeringskode,
                            legalStructureCode: row.Organisasjonsform,
                            isBankrupt: row.Konkurs === 'Ja',
                            isDeleted: row.Slettet === 'Ja',
                        };
                    });

                    resolve(inputData);
                },
            });
        });
    }

    function calculateStatistics(data: Organization[]) {

        const newStats: OrganizationStats = {
            totalOrgs: data.length,
            enk: data.filter((org) => org.legalStructureCode === "ENK").length,
            notEnk: data.filter((org) => org.legalStructureCode !== "ENK").length,
            asWithEmployees0To4: data.filter((org) => org.legalStructureCode === "AS" && org.numberOfEmployees >= 0 && org.numberOfEmployees <= 4).length,
            asWithEmployees5To10: data.filter((org) => org.legalStructureCode === "AS" && org.numberOfEmployees >= 5 && org.numberOfEmployees <= 10).length,
            asWithEmployeesGreaterThan10: data.filter((org) => org.legalStructureCode === "AS" && org.numberOfEmployees > 10).length,
        };

        setStats(newStats);
    }

    return (
        <div>
            <h1 id="tabelLabel">Statistikk</h1>
            <p>Last opp den nye CSV-filen med utfyllende organisasjonsinformasjon for å generere statistikk.</p>
            <input type="file" accept=".csv" onChange={handleInputFileChanged} />

            {inputData.length === 0 ? (
                <p>Ingen tilgjengelige data</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Kategori</th>
                            <th>Antall</th>
                            <th>Prosent</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Enkeltpersonforetak</td>
                            <td>{stats.enk}</td>
                            <td>{((stats.enk / stats.totalOrgs) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td>Andre organisasjonsformer</td>
                            <td>{stats.notEnk}</td>
                            <td>{((stats.notEnk / stats.totalOrgs) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td>Aksjeselskap 0-4 ansatte</td>
                            <td>{stats.asWithEmployees0To4}</td>
                            <td>{((stats.asWithEmployees0To4 / stats.totalOrgs) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td>Aksjeselskap 5-10 ansatte</td>
                            <td>{stats.asWithEmployees5To10}</td>
                             <td>{((stats.asWithEmployees5To10 / stats.totalOrgs) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td>Aksjeselskap {">"} 10 ansatte</td>
                            <td>{stats.asWithEmployeesGreaterThan10}</td>
                            <td>{((stats.asWithEmployeesGreaterThan10 / stats.totalOrgs) * 100).toFixed(2)}%</td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default OrgAnalysisComponent;