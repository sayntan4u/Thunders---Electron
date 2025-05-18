const path = require('path');
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const fs = require("fs");

class Utility {
    createLegalDocumentAndDeclaration(
        prospectName, prospectAddress, irID, amt, amtWords,
        bankAcc, bankName, irName, irAddress,
        product1 = "", product2 = "", product3 = "", product4 = "", product5 = ""
    ) {

        const inputPathDeclaration = path.resolve(__dirname, "../files/DECLARATION.docx");
        // console.log("inputPathDeclaration", inputPathDeclaration);
        // const outputPathDeclaration = "./public/legal/DECLARATION - " + prospectName + ".docx" ;//path.resolve(__dirname, "../public/legal/DECLARATION - " + prospectName + ".docx");

        const inputPathLegal = path.resolve(__dirname, "../files/LEGAL.docx");
        // const outputPathLegal = "./public/legal/LEGAL DOCUMENT - " + prospectName + ".docx";//path.resolve(__dirname, "../public/legal/LEGAL DOCUMENT - " + prospectName + ".docx");


        //Declaration

        //Load the docx file as binary content
        const content = fs.readFileSync(
            inputPathDeclaration,
            "binary"
        );
        // Unzip the content of the file
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
        doc.render({
            prospectName: prospectName,
            prospectAddress: prospectAddress,
            irID: irID,
            amt: amt,
            amtWords: amtWords,
            bankAcc: bankAcc,
            bankName: bankName,
            irName: irName,
            irAddress: irAddress,
            product1: product1,
            product2: product2,
            product3: product3,
            product4: product4,
            product5: product5

        });

        const buf = doc.getZip().generate({
            type: "base64",
            /*
             * Compression: DEFLATE adds a compression step.
             * For a 50MB document, expect 500ms additional CPU time.
             */
            compression: "DEFLATE",
        });

        // Write the Node.js Buffer to a file
        // fs.writeFileSync(outputPathDeclaration, buf);


        // //Legal

        // Load the docx file as binary content
        const contentLegal = fs.readFileSync(
            inputPathLegal,
            "binary"
        );
        // Unzip the content of the file
        const zipLegal = new PizZip(contentLegal);
        const docLegal = new Docxtemplater(zipLegal, {
            paragraphLoop: true,
            linebreaks: true,
        });
        docLegal.render({
            prospectName: prospectName,
            prospectAddress: prospectAddress,
            amt: amt,
            amtWords: amtWords,
            irName: irName,
            irAddress: irAddress,
        });

        const bufLegal = docLegal.getZip().generate({
            type: "base64",
            /*
             * Compression: DEFLATE adds a compression step.
             * For a 50MB document, expect 500ms additional CPU time.
             */
            compression: "DEFLATE",
        });

        // Write the Node.js Buffer to a file
        // fs.writeFileSync(outputPathLegal, bufLegal);

        return buf + "THUNDER_LEGAL_DOCUMENT" + bufLegal;
    }
}

const util = new Utility();

module.exports = util;