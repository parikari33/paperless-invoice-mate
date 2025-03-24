import { InvoiceData, InvoiceItem, ProcessingStatus } from '@/types/invoice';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Function to extract invoice data using Vision-Language Model API
export const extractInvoiceData = async (file: File): Promise<InvoiceData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const base64Image = event.target?.result?.toString().split(',')[1];
        
        if (!base64Image) {
          throw new Error('Failed to process image');
        }
        
        // Call the vision API with the image
        const extractedData = await callVisionAPI(base64Image);
        
        // Show a success toast
        toast.success('Invoice data extracted successfully');
        
        resolve(extractedData);
      } catch (error) {
        console.error('Error extracting invoice data:', error);
        toast.error('Failed to extract invoice data. Please try again.');
        reject(new Error('Failed to extract invoice data'));
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file. Please try a different file.');
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Function to call the OpenAI Vision API
const callVisionAPI = async (base64Image: string): Promise<InvoiceData> => {
  try {
    // Get the API key from localStorage or from window global
    const apiKey = localStorage.getItem('openaiApiKey') || (window as any).API_KEY;
    
    // Check if API key is available
    if (!apiKey) {
      console.warn('API key not provided. Using mock data instead.');
      // Wait to simulate API call
      await new Promise(r => setTimeout(r, 1500));
      return generateMockInvoiceData();
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at extracting invoice data from images. Extract all relevant details from the invoice image including invoice number, date, due date, customer information, line items, subtotal, tax rate, tax amount, and total. Format your response as valid JSON matching this structure: {\"invoiceNumber\": \"\", \"date\": \"\", \"dueDate\": \"\", \"customerName\": \"\", \"customerAddress\": \"\", \"customerEmail\": \"\", \"items\": [{\"id\": \"\", \"description\": \"\", \"quantity\": 0, \"unitPrice\": 0, \"amount\": 0}], \"subtotal\": 0, \"taxRate\": 0, \"taxAmount\": 0, \"total\": 0, \"notes\": \"\"}"
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all the invoice data from this image as JSON."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    // Extract the JSON from the response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in API response');
    }
    
    console.log('Raw API response content:', content);
    
    // Extract the JSON object from the content
    let extractedJson;
    try {
      // Try to parse the entire response as JSON
      extractedJson = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from text (in case model wrapped it in markdown or text)
      const jsonMatch = content.match(/```(?:json)?([\s\S]*?)```/) || 
                        content.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        try {
          const jsonContent = jsonMatch[0].replace(/```json|```/g, '').trim();
          console.log('Extracted JSON content:', jsonContent);
          extractedJson = JSON.parse(jsonContent);
        } catch (parseError) {
          console.error('Error parsing extracted JSON:', parseError);
          throw new Error('Failed to parse JSON from API response');
        }
      } else {
        throw new Error('Failed to find JSON in API response');
      }
    }
    
    console.log('Extracted data before processing:', extractedJson);
    
    // Process the extracted data to ensure it matches our expected format
    const processedData = processExtractedData(extractedJson);
    
    console.log('Processed invoice data:', processedData);
    
    return processedData;
  } catch (error) {
    console.error('Error calling Vision API:', error);
    // Fall back to mock data if the API call fails
    toast.error('Error processing with AI. Using sample data instead.');
    return generateMockInvoiceData();
  }
};

// Process and validate the extracted data
const processExtractedData = (extractedData: any): InvoiceData => {
  // Ensure items have proper structure and IDs
  const processedItems = (extractedData.items || []).map((item: any) => ({
    id: item.id || uuidv4(),
    description: item.description || '',
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    amount: Number(item.amount) || (Number(item.quantity) * Number(item.unitPrice)) || 0
  }));
  
  // Calculate subtotal from items if not provided
  const subtotal = extractedData.subtotal || 
                  processedItems.reduce((sum: number, item: InvoiceItem) => sum + item.amount, 0);
  
  // Calculate tax amount if not provided
  const taxRate = Number(extractedData.taxRate) || 0;
  const taxAmount = extractedData.taxAmount || (subtotal * taxRate / 100);
  
  // Calculate total if not provided
  const total = extractedData.total || (subtotal + taxAmount);
  
  return {
    invoiceNumber: extractedData.invoiceNumber || `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    date: extractedData.date || new Date().toISOString().split('T')[0],
    dueDate: extractedData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: extractedData.customerName || '',
    customerAddress: extractedData.customerAddress || '',
    customerEmail: extractedData.customerEmail || '',
    items: processedItems.length ? processedItems : [createDefaultItem()],
    subtotal,
    taxRate,
    taxAmount,
    total,
    notes: extractedData.notes || 'Thank you for your business!'
  };
};

// Create a default empty item
const createDefaultItem = (): InvoiceItem => ({
  id: uuidv4(),
  description: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0
});

// Helper function to generate mock invoice data for demo purposes
const generateMockInvoiceData = (): InvoiceData => {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const items: InvoiceItem[] = [
    {
      id: uuidv4(),
      description: 'Web Design Services',
      quantity: 1,
      unitPrice: 1500,
      amount: 1500
    },
    {
      id: uuidv4(),
      description: 'Hosting (Annual)',
      quantity: 1,
      unitPrice: 150,
      amount: 150
    }
  ];
  
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 7.5;
  const taxAmount = (taxRate / 100) * subtotal;
  const total = subtotal + taxAmount;
  
  return {
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    date: formatDate(today),
    dueDate: formatDate(dueDate),
    customerName: 'Acme Corporation',
    customerAddress: '123 Business Ave, Suite 100, San Francisco, CA 94107',
    customerEmail: 'accounting@acmecorp.example',
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    notes: 'Thank you for your business!'
  };
};

// Function to download invoice as JSON
export const downloadInvoiceJson = (data: InvoiceData): void => {
  // Create a JSON string with pretty formatting (2 spaces indent)
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice_${data.invoiceNumber}.json`;
  
  // Trigger a click on the anchor
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Show success toast
  toast.success('Invoice data downloaded as JSON');
};

// Function to generate and download a PDF from invoice data
export const generateInvoicePdf = async (data: InvoiceData): Promise<Blob> => {
  // Import dynamically to reduce initial load time
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');
  
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `Invoice ${data.invoiceNumber}`,
    subject: 'Invoice',
    author: 'Paperless Invoice Mate',
    creator: 'Paperless Invoice Mate'
  });
  
  // Add company logo/header
  doc.setFontSize(24);
  doc.setTextColor(41, 128, 185); // Blue color
  doc.text('INVOICE', 105, 20, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Invoice Number: ${data.invoiceNumber}`, 20, 35);
  doc.text(`Issue Date: ${new Date(data.date).toLocaleDateString()}`, 20, 40);
  doc.text(`Due Date: ${new Date(data.dueDate).toLocaleDateString()}`, 20, 45);
  
  // Add issuer information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('From:', 20, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Paperless Invoice Mate', 20, 65);
  doc.text('123 Company Street', 20, 70);
  doc.text('Business City, BZ 12345', 20, 75);
  doc.text('billing@paperlessinvoice.example', 20, 80);
  
  // Add customer information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 120, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(data.customerName, 120, 65);
  
  // Handle multiline addresses
  const addressLines = data.customerAddress.split(',');
  let yPos = 70;
  addressLines.forEach((line, index) => {
    doc.text(line.trim(), 120, yPos);
    yPos += 5;
  });
  
  doc.text(data.customerEmail, 120, yPos);
  
  // Add invoice items table
  autoTable(doc, {
    startY: 90,
    head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
    body: data.items.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.amount.toFixed(2)}`
    ]),
    foot: [
      ['', '', 'Subtotal', `$${data.subtotal.toFixed(2)}`],
      ['', '', `Tax (${data.taxRate}%)`, `$${data.taxAmount.toFixed(2)}`],
      ['', '', 'Total', `$${data.total.toFixed(2)}`]
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [60, 60, 60],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Get the y-position after the table
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  // Add notes
  if (data.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, finalY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(data.notes, 20, finalY + 20);
  }
  
  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated with Paperless Invoice Mate', 105, 285, { align: 'center' });
  
  // Return the PDF as a blob
  return doc.output('blob');
};

// Download the invoice as PDF
export const downloadInvoicePdf = async (data: InvoiceData): Promise<void> => {
  try {
    const pdfBlob = await generateInvoicePdf(data);
    
    // Create a URL for the blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${data.invoiceNumber}.pdf`;
    
    // Trigger a click on the anchor
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success toast
    toast.success('Invoice downloaded as PDF');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF. Please try again.');
  }
};

// Get PDF URL for preview
export const getInvoicePdfUrl = async (data: InvoiceData): Promise<string> => {
  try {
    const pdfBlob = await generateInvoicePdf(data);
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    toast.error('Failed to generate PDF preview. Please try again.');
    throw error;
  }
};
