
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  MinusCircle,
  Download, 
  CalendarIcon, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Eye
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceData, InvoiceItem, ValidationError, FileFormat, PdfPreviewOptions } from '@/types/invoice';
import { validateInvoiceData, formatCurrency, calculateInvoiceTotal } from '@/utils/validationUtils';
import { downloadInvoiceJson, downloadInvoicePdf, getInvoicePdfUrl } from '@/utils/invoiceExtractor';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PdfPreviewModal from './PdfPreviewModal';

interface InvoiceFormProps {
  initialData: InvoiceData;
  className?: string;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, className }) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fileFormat, setFileFormat] = useState<FileFormat>(FileFormat.JSON);
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewOptions>({
    isOpen: false,
    url: null
  });

  useEffect(() => {
    // Recalculate totals when items, tax rate change
    const updatedData = calculateInvoiceTotal(invoiceData);
    setInvoiceData(updatedData);
  }, [invoiceData.items, invoiceData.taxRate]);

  const getError = (field: string): string | undefined => {
    const error = errors.find(e => e.field === field);
    return error ? error.message : undefined;
  };

  const handleInputChange = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    setInvoiceData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: uuidv4(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    if (invoiceData.items.length === 1) {
      toast.error('Invoice must have at least one item');
      return;
    }
    
    const updatedItems = [...invoiceData.items];
    updatedItems.splice(index, 1);
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handlePreviewPdf = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate the form first
      const validationErrors = validateInvoiceData(invoiceData);
      setErrors(validationErrors);

      if (validationErrors.length > 0) {
        toast.error(`Please fix ${validationErrors.length} error${validationErrors.length > 1 ? 's' : ''} in the form`);
        setIsSubmitting(false);
        return;
      }
      
      // Get PDF URL for preview
      const url = await getInvoicePdfUrl(invoiceData);
      
      // Open the preview modal
      setPdfPreview({
        isOpen: true,
        url
      });
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      toast.error('Failed to generate PDF preview. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClosePdfPreview = () => {
    // Close the preview and revoke the URL
    if (pdfPreview.url) {
      URL.revokeObjectURL(pdfPreview.url);
    }
    
    setPdfPreview({
      isOpen: false,
      url: null
    });
  };

  const handleDownloadPdf = async () => {
    if (pdfPreview.isOpen) {
      // Close the preview modal first
      handleClosePdfPreview();
    }
    
    try {
      await downloadInvoicePdf(invoiceData);
      setShowSuccessMessage(true);
      
      // Hide success message after a delay
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate the form
    const validationErrors = validateInvoiceData(invoiceData);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      // Form is valid, proceed with submission
      try {
        // In a real app, you might save to a database here
        setTimeout(async () => {
          if (fileFormat === FileFormat.PDF) {
            await handleDownloadPdf();
          } else {
            downloadInvoiceJson(invoiceData);
            setShowSuccessMessage(true);
            
            // Hide success message after a delay
            setTimeout(() => {
              setShowSuccessMessage(false);
            }, 3000);
          }
          
          setIsSubmitting(false);
        }, 500);
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('Failed to submit form. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      toast.error(`Please fix ${validationErrors.length} error${validationErrors.length > 1 ? 's' : ''} in the form`);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className={cn('w-full shadow-sm overflow-hidden bg-card backdrop-blur-sm animate-slide-in border-primary/10', className)}>
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-xl font-medium">Invoice #{invoiceData.invoiceNumber}</CardTitle>
          <CardDescription>
            Review and edit the extracted invoice information
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Invoice Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">
                  Invoice Number
                  {getError('invoiceNumber') && (
                    <span className="ml-1 text-destructive text-xs">*</span>
                  )}
                </Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className={cn(
                    getError('invoiceNumber') ? 'border-destructive' : '',
                    'bg-background/50'
                  )}
                />
                {getError('invoiceNumber') && (
                  <p className="text-destructive text-xs mt-1">{getError('invoiceNumber')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Invoice Date
                  {getError('date') && (
                    <span className="ml-1 text-destructive text-xs">*</span>
                  )}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background/50",
                        !invoiceData.date && "text-muted-foreground",
                        getError('date') && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoiceData.date ? new Date(invoiceData.date).toLocaleDateString() : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={invoiceData.date ? new Date(invoiceData.date) : undefined}
                      onSelect={(date) => handleInputChange('date', date ? date.toISOString().split('T')[0] : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {getError('date') && (
                  <p className="text-destructive text-xs mt-1">{getError('date')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  Due Date
                  {getError('dueDate') && (
                    <span className="ml-1 text-destructive text-xs">*</span>
                  )}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background/50",
                        !invoiceData.dueDate && "text-muted-foreground",
                        getError('dueDate') && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined}
                      onSelect={(date) => handleInputChange('dueDate', date ? date.toISOString().split('T')[0] : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {getError('dueDate') && (
                  <p className="text-destructive text-xs mt-1">{getError('dueDate')}</p>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name
                  {getError('customerName') && (
                    <span className="ml-1 text-destructive text-xs">*</span>
                  )}
                </Label>
                <Input
                  id="customerName"
                  value={invoiceData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className={cn(
                    getError('customerName') ? 'border-destructive' : '',
                    'bg-background/50'
                  )}
                />
                {getError('customerName') && (
                  <p className="text-destructive text-xs mt-1">{getError('customerName')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">
                  Customer Email
                  {getError('customerEmail') && (
                    <span className="ml-1 text-destructive text-xs">*</span>
                  )}
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={invoiceData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  className={cn(
                    getError('customerEmail') ? 'border-destructive' : '',
                    'bg-background/50'
                  )}
                />
                {getError('customerEmail') && (
                  <p className="text-destructive text-xs mt-1">{getError('customerEmail')}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">Customer Address</Label>
              <Textarea
                id="customerAddress"
                value={invoiceData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                className="resize-none bg-background/50"
                rows={2}
              />
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Invoice Items</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addItem}
                  className="flex items-center text-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4 rounded-md border overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground py-2 px-3 border-b bg-muted/30">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Items */}
                <div className="max-h-[300px] overflow-y-auto px-2 py-1 space-y-2">
                  {invoiceData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md hover:bg-muted/20 transition-colors">
                      <div className="col-span-5">
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className={cn(
                            getError(`items[${index}].description`) ? 'border-destructive' : '',
                            'bg-background/50'
                          )}
                        />
                        {getError(`items[${index}].description`) && (
                          <p className="text-destructive text-xs mt-1">{getError(`items[${index}].description`)}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className={cn(
                            getError(`items[${index}].quantity`) ? 'border-destructive' : '',
                            'bg-background/50'
                          )}
                        />
                        {getError(`items[${index}].quantity`) && (
                          <p className="text-destructive text-xs mt-1">{getError(`items[${index}].quantity`)}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className={cn(
                            getError(`items[${index}].unitPrice`) ? 'border-destructive' : '',
                            'bg-background/50'
                          )}
                        />
                        {getError(`items[${index}].unitPrice`) && (
                          <p className="text-destructive text-xs mt-1">{getError(`items[${index}].unitPrice`)}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Input
                          readOnly
                          value={formatCurrency(item.amount)}
                          className="bg-muted/30 border-muted"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="resize-none h-32 bg-background/50"
                />
              </div>

              <div className="space-y-4 p-4 rounded-lg bg-muted/20 border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoiceData.subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Tax Rate:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={invoiceData.taxRate}
                      onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                      className="w-16 h-8 text-right bg-background/70"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <span className="font-medium">{formatCurrency(invoiceData.taxAmount)}</span>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">{formatCurrency(invoiceData.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5 border-t border-primary/10 py-4">
          <div className="text-xs text-muted-foreground">
            <span className="inline-flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              All fields marked with * are required
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {showSuccessMessage && (
              <div className="flex items-center text-sm text-green-600 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>Invoice downloaded successfully!</span>
              </div>
            )}
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handlePreviewPdf}
                className="flex-1 sm:flex-none"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none bg-primary text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download as {fileFormat === FileFormat.JSON ? 'JSON' : 'PDF'}
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFileFormat(FileFormat.JSON)} className="flex items-center">
                    <div className="w-4 h-4 mr-2">{fileFormat === FileFormat.JSON && <CheckCircle2 className="h-4 w-4" />}</div>
                    <FileText className="h-4 w-4 mr-2" />
                    <span>JSON</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFileFormat(FileFormat.PDF)} className="flex items-center">
                    <div className="w-4 h-4 mr-2">{fileFormat === FileFormat.PDF && <CheckCircle2 className="h-4 w-4" />}</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <path d="M9 15v-2h6v2"></path>
                      <path d="M12 19v-6"></path>
                    </svg>
                    <span>PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={pdfPreview.isOpen}
        onClose={handleClosePdfPreview}
        pdfUrl={pdfPreview.url}
        invoiceNumber={invoiceData.invoiceNumber}
        onDownload={handleDownloadPdf}
      />
    </>
  );
};

export default InvoiceForm;
