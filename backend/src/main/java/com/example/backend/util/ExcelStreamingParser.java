package com.example.backend.util;

import com.example.backend.dto.BulkUploadResultDTO;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.model.SharedStrings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * SAX-based streaming Excel parser — handles files with millions of rows
 * without loading the whole workbook into memory.
 *
 * Calls rowConsumer for each data row (after the header row).
 * Returns list of RowError for rows that fail validation at parse time.
 */
public class ExcelStreamingParser {

    private static final Logger log = LoggerFactory.getLogger(ExcelStreamingParser.class);

    /**
     * Represents a parsed row with the three mandatory columns.
     */
    public static class ParsedRow {
        public int rowNum;
        public String name;
        public String dateOfBirth;
        public String nicNumber;
    }

    public static long parse(InputStream excelStream,
                              Consumer<ParsedRow> rowConsumer,
                              List<BulkUploadResultDTO.RowError> errors) {
        long[] count = {0};
        try (OPCPackage pkg = OPCPackage.open(excelStream)) {
            XSSFReader reader = new XSSFReader(pkg);
            SharedStrings sst = reader.getSharedStringsTable();

            SAXParserFactory factory = SAXParserFactory.newInstance();
            SAXParser parser = factory.newSAXParser();
            XMLReader xmlReader = parser.getXMLReader();

            RowHandler handler = new RowHandler(sst, rowConsumer, errors, count);
            xmlReader.setContentHandler(handler);

            XSSFReader.SheetIterator sheets = (XSSFReader.SheetIterator) reader.getSheetsData();
            if (sheets.hasNext()) {
                // Only parse the first sheet
                try (InputStream sheetStream = sheets.next()) {
                    xmlReader.parse(new InputSource(sheetStream));
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Excel file", e);
            errors.add(new BulkUploadResultDTO.RowError(0, "Failed to read file: " + e.getMessage()));
        }
        return count[0];
    }

    // ── SAX Handler ────────────────────────────────────────────────────────────

    private static class RowHandler extends DefaultHandler {

        private final SharedStrings sst;
        private final Consumer<ParsedRow> rowConsumer;
        private final List<BulkUploadResultDTO.RowError> errors;
        private final long[] count;

        private int currentRow = 0;
        private boolean isSharedString = false;
        private boolean isInlineString = false;
        private final StringBuilder cellValue = new StringBuilder();
        private final List<String> rowValues = new ArrayList<>();
        private boolean headerSkipped = false;

        RowHandler(SharedStrings sst, Consumer<ParsedRow> rowConsumer,
                   List<BulkUploadResultDTO.RowError> errors, long[] count) {
            this.sst         = sst;
            this.rowConsumer = rowConsumer;
            this.errors      = errors;
            this.count       = count;
        }

        @Override
        public void startElement(String uri, String localName, String qName, Attributes attrs) {
            if ("row".equals(qName)) {
                currentRow++;
                rowValues.clear();
            } else if ("c".equals(qName)) {
                cellValue.setLength(0);
                String t = attrs.getValue("t");
                isSharedString = "s".equals(t);
                isInlineString = "inlineStr".equals(t);
            } else if ("v".equals(qName) || "t".equals(qName)) {
                cellValue.setLength(0);
            }
        }

        @Override
        public void characters(char[] ch, int start, int length) {
            cellValue.append(ch, start, length);
        }

        @Override
        public void endElement(String uri, String localName, String qName) {
            if ("v".equals(qName) || ("t".equals(qName) && isInlineString)) {
                String val = cellValue.toString().trim();
                if (isSharedString) {
                    try {
                        int idx = Integer.parseInt(val);
                        val = sst.getItemAt(idx).getString();
                    } catch (Exception e) {
                        val = "";
                    }
                }
                rowValues.add(val);
            } else if ("row".equals(qName)) {
                // Skip header
                if (!headerSkipped) { headerSkipped = true; return; }

                // Pad to 3 columns
                while (rowValues.size() < 3) rowValues.add("");

                String name    = rowValues.get(0).trim();
                String dob     = rowValues.get(1).trim();
                String nic     = rowValues.get(2).trim();

                // Skip entirely blank rows
                if (name.isEmpty() && dob.isEmpty() && nic.isEmpty()) return;

                if (name.isEmpty() || dob.isEmpty() || nic.isEmpty()) {
                    errors.add(new BulkUploadResultDTO.RowError(currentRow,
                            "Missing mandatory field(s): name=" + name + ", dob=" + dob + ", nic=" + nic));
                    return;
                }

                ParsedRow pr = new ParsedRow();
                pr.rowNum      = currentRow;
                pr.name        = name;
                pr.dateOfBirth = dob;
                pr.nicNumber   = nic;
                count[0]++;
                rowConsumer.accept(pr);
            }
        }
    }
}
