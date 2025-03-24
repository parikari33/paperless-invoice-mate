
import React, { useState, useEffect } from 'react';
import InvoiceUploader from '@/components/InvoiceUploader';
import InvoiceForm from '@/components/InvoiceForm';
import ApiKeyInput from '@/components/ApiKeyInput';
import ProcessingAnimation from '@/components/ProcessingAnimation';
import { extractInvoiceData } from '@/utils/invoiceExtractor';
import { InvoiceData, ProcessingStatus } from '@/types/invoice';
import { toast } from 'sonner';

const Index = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    // Update the global API_KEY variable in the invoiceExtractor.ts
    (window as any).API_KEY = key;
  };

  useEffect(() => {
    // Check for API key in localStorage on component mount
    const storedApiKey = localStorage.getItem('openaiApiKey');
    if (storedApiKey) {
      handleApiKeySet(storedApiKey);
    }
  }, []);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-card/80 sticky top-0 z-10">
        <div className="container py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            <h1 className="text-2xl font-medium tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              Paperless Invoice Mate
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Extract, validate, and export invoice data with precision
            </p>
          </div>
          
          <div className="flex items-center">
            <a 
              href="https://github.com/your-repo" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-transparent hover:border-border flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                <path d="M9 18c-4.51 2-5-2-7-2"></path>
              </svg>
              <span>Documentation</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-8 sm:px-6 sm:py-12 flex flex-col">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Intro Section */}
          <section className="text-center space-y-3 px-4 animate-fade-in">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m16 10-4.35 6.15a1 1 0 0 1-1.5.14l-1.67-1.79a1 1 0 0 0-1.48 0L4.5 17.5"></path>
                <path d="M14.5 8 18 9.5l-2.5 3"></path>
              </svg>
              <span>AI-Powered Invoice Processing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
              Transform Handwritten Invoices into Structured Data
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload an invoice image and let our AI extract all key information. Review, validate, and export to JSON or PDF in seconds.
            </p>
          </section>

          {/* API Key Input Section */}
          <section className="w-full">
            <ApiKeyInput onApiKeySet={handleApiKeySet} />
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
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-8">
        <div className="container py-6 px-4 sm:px-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Paperless Invoice Mate. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Powered by Vision-Language Models for accurate invoice data extraction
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
