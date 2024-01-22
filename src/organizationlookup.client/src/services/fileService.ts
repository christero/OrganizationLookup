class FileService {

    static async readCSVFile(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target) {
                    resolve(event.target.result as string);
                }
            };
            reader.readAsText(file);
        });
    }

    static downloadFile(fileName: string, content: string, fileType: string): void {
        const blob = new Blob([content], { type: fileType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    }
}

export default FileService;