
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { toast } from 'sonner';

// This would be replaced with actual AI-powered extraction
// For now, it simulates the extraction with a timeout
export const extractInvoiceData = async (file: File): Promise<InvoiceData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        // Simulate AI processing time
        await new Promise(r => setTimeout(r, 2500));
        
        // If this was a real implementation, we would:
        // 1. Send the image to a vision model API
        // 2. Process the returned text to extract invoice data
        // 3. Structure the data according to our InvoiceData interface
        
        // Instead, we'll generate mock data for demo purposes
        const mockData = generateMockInvoiceData();
        
        // Show a success toast
        toast.success('Invoice data extracted successfully');
        
        resolve(mockData);
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
      id: '1',
      description: 'Web Design Services',
      quantity: 1,
      unitPrice: 1500,
      amount: 1500
    },
    {
      id: '2',
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
