// src/lib/swiftParsers.ts

export interface ParsedJsonSwiftData {
  fundAmount?: number;
  fundCurrency?: string;
  fundReference?: string;
  fundTransactionId?: string;
  bankName?: string;
  accountNumber?: string;
  dateAdded?: string;
  notes?: string;
  numBlockchainTransactions?: number;
  rawData?: any; // To store the original parsed data if needed
}

export interface ParsedXmlSwiftData {
  messageId?: string;
  creationDateTime?: string;
  numberOfTransactions?: string; // Usually "1" for a single pacs.008
  controlSum?: number; // Sum of settlement amounts
  settlementAmount?: number;
  settlementCurrency?: string;
  settlementDate?: string;
  debtorName?: string;
  debtorAccount?: string; // IBAN or other identifier
  creditorName?: string;
  creditorAccount?: string; // IBAN or other identifier
  purposeCode?: string;
  remittanceInfo?: string;
  rawData?: any; // To store the raw XML document for inspection if needed
}

export interface ParsedFinBinSwiftData {
  transactionReference?: string; // :20:
  valueDate?: string;            // from :32A:
  currency?: string;             // from :32A:
  amount?: number;               // from :32A:
  orderingCustomer?: string;     // :50K: or :50A:
  beneficiaryCustomer?: string;  // :59: or :59A:
  remittanceInfo?: string;       // :70:
  detailsOfCharges?: string;     // :71A:
  rawData?: string; // Store the ASCII representation for inspection
  parserNotes?: string[];
}

/**
 * Parses JSON string data assuming a specific structure.
 * @param jsonString The JSON string to parse.
 * @returns An object with extracted fields.
 */
export function parseJsonSwiftData(jsonString: string): ParsedJsonSwiftData {
  try {
    const data = JSON.parse(jsonString);
    const fund = data?.data?.fund;
    const transactions = data?.data?.transactions;

    if (!fund) {
      throw new Error("Missing 'fund' data in JSON structure.");
    }

    return {
      fundAmount: fund.amount,
      fundCurrency: fund.currency || 'USD', // Assuming USD if not present
      fundReference: fund.reference,
      fundTransactionId: fund.transaction_id,
      bankName: fund.bank_name,
      accountNumber: fund.account_number,
      dateAdded: fund.date_added,
      notes: fund.notes,
      numBlockchainTransactions: Array.isArray(transactions) ? transactions.length : 0,
      rawData: data, // Store original data for reference
    };
  } catch (error: any) {
    console.error("Error parsing JSON SWIFT data:", error);
    throw new Error(`JSON Parsing Error: ${error.message}`);
  }
}

/**
 * Helper to get text content from an XML element.
 * @param parentElement The parent XML element.
 * @param tagName The name of the child tag.
 * @returns Text content or undefined.
 */
function getElementText(parentElement: Element | null | undefined, tagName: string): string | undefined {
  if (!parentElement) return undefined;
  const element = parentElement.getElementsByTagName(tagName)?.[0];
  return element?.textContent || undefined;
}

/**
 * Parses XML string data assuming a pacs.008 structure.
 * @param xmlString The XML string to parse.
 * @returns An object with extracted fields.
 */
export function parseXmlSwiftData(xmlString: string): ParsedXmlSwiftData {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Check for parser errors
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
        throw new Error(`XML Parsing Error: ${parserError[0].textContent || 'Unknown parser error'}`);
    }
    
    const grpHdr = xmlDoc.getElementsByTagName("GrpHdr")?.[0];
    const cdtTrfTxInf = xmlDoc.getElementsByTagName("CdtTrfTxInf")?.[0]; // Assuming one transaction for simplicity
    const intrBkSttlmAmtEl = cdtTrfTxInf?.getElementsByTagName("IntrBkSttlmAmt")?.[0];

    if (!grpHdr || !cdtTrfTxInf) {
        throw new Error("Required XML elements (GrpHdr or CdtTrfTxInf) not found. Ensure it's a valid pacs.008 message.");
    }

    const settlementAmountStr = intrBkSttlmAmtEl?.textContent;
    const settlementCurrency = intrBkSttlmAmtEl?.getAttribute("Ccy");

    return {
      messageId: getElementText(grpHdr, "MsgId"),
      creationDateTime: getElementText(grpHdr, "CreDtTm"),
      numberOfTransactions: getElementText(grpHdr, "NbOfTxs"),
      controlSum: parseFloat(getElementText(grpHdr, "CtrlSum") || "0"),
      settlementAmount: settlementAmountStr ? parseFloat(settlementAmountStr) : undefined,
      settlementCurrency: settlementCurrency || undefined,
      settlementDate: getElementText(cdtTrfTxInf, "IntrBkSttlmDt"),
      debtorName: getElementText(cdtTrfTxInf?.getElementsByTagName("Dbtr")?.[0], "Nm"),
      debtorAccount: getElementText(cdtTrfTxInf?.getElementsByTagName("DbtrAcct")?.[0]?.getElementsByTagName("Id")?.[0], "IBAN"), // Prefers IBAN
      creditorName: getElementText(cdtTrfTxInf?.getElementsByTagName("Cdtr")?.[0], "Nm"),
      creditorAccount: getElementText(cdtTrfTxInf?.getElementsByTagName("CdtrAcct")?.[0]?.getElementsByTagName("Id")?.[0], "IBAN"), // Prefers IBAN
      purposeCode: getElementText(cdtTrfTxInf?.getElementsByTagName("Purp")?.[0], "Cd"),
      remittanceInfo: getElementText(cdtTrfTxInf?.getElementsByTagName("RmtInf")?.[0], "Ustrd"),
      rawData: xmlDoc, // Store parsed XML doc for reference
    };
  } catch (error: any) {
    console.error("Error parsing XML SWIFT data:", error);
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
}

/**
 * Parses a hex string representing a SWIFT MT103 message (best-effort).
 * @param hexContent The hex string of the MT103 message.
 * @returns An object with extracted fields.
 */
export function parseFinBinSwiftData(hexContent: string): ParsedFinBinSwiftData {
  const parserNotes: string[] = ["Basic MT103 parser, may not capture all details or handle all variations."];
  try {
    // Convert hex to ASCII
    let asciiContent = "";
    for (let i = 0; i < hexContent.length; i += 2) {
      asciiContent += String.fromCharCode(parseInt(hexContent.substring(i, i + 2), 16));
    }
    // Normalize line endings and remove potential FIN block wrappers like {1:...}{2:...}{4:...-}
    // This basic parser assumes the core message block {4:...} content.
    // A more robust parser would handle block structures properly.
    const coreMessageMatch = asciiContent.match(/{4:\s*([\s\S]*?)\s*-?}/);
    let messageBody = asciiContent; // Default to full content if block 4 not found
    
    if (coreMessageMatch && coreMessageMatch[1]) {
        messageBody = coreMessageMatch[1].replace(/\r\n/g, '\n').trim();
        parserNotes.push("Extracted content from block {4:...}.");
    } else {
        parserNotes.push("Block {4:...} not explicitly found; parsing entire content. Results may be less accurate.");
        messageBody = messageBody.replace(/\r\n/g, '\n').trim(); // Still normalize
    }


    const result: ParsedFinBinSwiftData = { parserNotes, rawData: asciiContent };

    const fields = messageBody.split(/\n:/).map(field => field.startsWith(':') ? field : ':' + field);

    fields.forEach(field => {
      if (field.startsWith(":20:")) {
        result.transactionReference = field.substring(4).trim();
      } else if (field.startsWith(":32A:")) {
        const content = field.substring(5).trim(); // YYMMDDCCYAMOUNT
        if (content.length >= 6) {
            result.valueDate = `20${content.substring(0, 2)}-${content.substring(2, 4)}-${content.substring(4, 6)}`; // Assuming 21st century
        }
        result.currency = content.substring(6, 9);
        const amountStr = content.substring(9).replace(',', '.');
        result.amount = parseFloat(amountStr);
      } else if (field.startsWith(":50K:") || field.startsWith(":50A:")) {
        result.orderingCustomer = (result.orderingCustomer ? result.orderingCustomer + "\n" : "") + field.substring(field.indexOf(':') + 1).trim();
      } else if (field.startsWith(":59:") || field.startsWith(":59A:")) {
         result.beneficiaryCustomer = (result.beneficiaryCustomer ? result.beneficiaryCustomer + "\n" : "") + field.substring(field.indexOf(':') + 1).trim();
      } else if (field.startsWith(":70:")) {
        result.remittanceInfo = (result.remittanceInfo ? result.remittanceInfo + "\n" : "") + field.substring(4).trim();
      } else if (field.startsWith(":71A:")) {
        result.detailsOfCharges = field.substring(5).trim();
      }
    });

    if (Object.keys(result).length === 2 && !result.transactionReference) { // only parserNotes and rawData
        parserNotes.push("No common MT103 fields were identified. The content might not be a standard MT103 message body or is heavily customized.");
    }


    return result;
  } catch (error: any) {
    console.error("Error parsing FIN/BIN SWIFT data:", error);
    parserNotes.push(`FIN/BIN Parsing Error: ${error.message}`);
    return { parserNotes, rawData: "Error during parsing: " + error.message };
  }
}
