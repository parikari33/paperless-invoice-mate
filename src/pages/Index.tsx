
import React, { useState } from 'react';
import InvoiceUploader from '@/components/InvoiceUploader';
import InvoiceForm from '@/components/InvoiceForm';
import ProcessingAnimation from '@/components/ProcessingAnimation';
import { extractInvoiceData } from '@/utils/invoiceExtractor';
import { InvoiceData, ProcessingStatus } from '@/types/invoice';
import { toast } from 'sonner';

const Index = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const handleFileUploaded = async (file: File) => {
    try {
      setStatus(ProcessingStatus.UPLOADING);
      
      // Short delay to show uploading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStatus(ProcessingStatus.PROCESSING);
      
      // Extract data from the invoice
      const extractedData = await extractInvoiceData(file);
      
      setInvoiceData(extractedData);
      setStatus(ProcessingStatus.COMPLETE);
    } catch (error) {
      console.error('Error processing invoice:', error);
      toast.error('Failed to process invoice. Please try again.');
      setStatus(ProcessingStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            <h1 className="text-2xl font-medium tracking-tight">Paperless Invoice Mate</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Extract, validate, and export invoice data with precision
            </p>
          </div>
          
          <div className="flex items-center">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-transparent hover:border-border"
            >
              Documentation
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-8 sm:px-6 sm:py-12 flex flex-col">
        <div className="max-w-5xl mx-auto w-full space-y-12">
          {/* Intro Section */}
          <section className="text-center space-y-3 px-4 animate-fade-in">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
              <span>AI-Powered Invoice Processing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">Transform Handwritten Invoices into Structured Data</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload an invoice image and let our AI extract all key information. Review, validate, and export to JSON in seconds.
            </p>
          </section>

          {/* Upload Section */}
          <section className="w-full">
            <InvoiceUploader 
              onFileUploaded={handleFileUploaded} 
              status={status} 
            />
          </section>
          
          {/* Processing Section */}
          {status === ProcessingStatus.PROCESSING && (
            <section className="w-full animate-fade-in">
              <ProcessingAnimation message="Extracting invoice data" />
            </section>
          )}
          
          {/* Form Section */}
          {status === ProcessingStatus.COMPLETE && invoiceData && (
            <section className="w-full">
              <InvoiceForm initialData={invoiceData} />
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-6 px-4 sm:px-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Paperless Invoice Mate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
