import { Sale } from "@/lib/database";
import { format } from "date-fns";

interface PrintReceiptProps {
  sale: Sale;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

export function PrintReceipt({ 
  sale, 
  storeName = "Your Store Name",
  storeAddress = "Store Address",
  storePhone = "Phone Number"
}: PrintReceiptProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('my-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${sale.voucherNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', monospace; 
            width: 80mm; 
            margin: 0 auto; 
            padding: 10px;
            font-size: 12px;
            line-height: 1.2;
          }
          .header { text-align: center; margin-bottom: 15px; }
          .store-name { font-size: 16px; font-weight: bold; }
          .store-info { font-size: 10px; margin-top: 5px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .receipt-info { margin-bottom: 10px; }
          .receipt-info div { margin-bottom: 2px; }
          .items { margin-bottom: 10px; }
          .item { margin-bottom: 3px; }
          .item-name { font-weight: bold; }
          .item-details { display: flex; justify-content: space-between; font-size: 10px; }
          .totals { margin-top: 10px; }
          .total-line { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .grand-total { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }
          .footer { text-align: center; margin-top: 15px; font-size: 10px; }
          @media print {
            @page { margin: 0; }
            body { width: 80mm; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="store-name">${storeName}</div>
            <div class="store-info">
              ${storeAddress}<br>
              Tel: ${storePhone}
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="receipt-info">
            <div>Voucher: ${sale.voucherNumber}</div>
            <div>Date: ${format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</div>
            <div>Cashier: ${sale.createdBy}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="items">
            ${sale.items.map(item => `
              <div class="item">
                <div class="item-name">${item.productName}</div>
                <div class="item-details">
                  <span>${item.quantity} x ${formatCurrency(item.salePrice)}</span>
                  <span>${formatCurrency(item.totalSale)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="divider"></div>
          
          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>${formatCurrency(sale.totalSale)}</span>
            </div>
            <div class="total-line grand-total">
              <span>TOTAL:</span>
              <span>${formatCurrency(sale.totalSale)}</span>
            </div>
            <div class="total-line">
              <span>Received:</span>
              <span>${formatCurrency(sale.receivedAmount)}</span>
            </div>
            <div class="total-line">
              <span>Change:</span>
              <span>${formatCurrency(sale.changeAmount)}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            Thank you for your purchase!<br>
            Please come again
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <button onClick={printReceipt} className="print-receipt-button">
      Print Receipt
    </button>
  );
}

export function printReceiptDialog(sale: Sale): Promise<boolean> {
  return new Promise((resolve) => {
    const result = window.confirm(
      `Sale completed successfully!\nVoucher: ${sale.voucherNumber}\nTotal: ${new Intl.NumberFormat('my-MM', {
        style: 'currency',
        currency: 'MMK',
        minimumFractionDigits: 0
      }).format(sale.totalSale)}\n\nDo you want to print the receipt?`
    );
    
    if (result) {
      // Create a print function directly
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        resolve(false);
        return;
      }

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('my-MM', {
          style: 'currency',
          currency: 'MMK',
          minimumFractionDigits: 0
        }).format(amount);
      };

      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${sale.voucherNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              width: 80mm; 
              margin: 0 auto; 
              padding: 10px;
              font-size: 12px;
              line-height: 1.2;
            }
            .header { text-align: center; margin-bottom: 15px; }
            .store-name { font-size: 16px; font-weight: bold; }
            .store-info { font-size: 10px; margin-top: 5px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .receipt-info { margin-bottom: 10px; }
            .receipt-info div { margin-bottom: 2px; }
            .items { margin-bottom: 10px; }
            .item { margin-bottom: 3px; }
            .item-name { font-weight: bold; }
            .item-details { display: flex; justify-content: space-between; font-size: 10px; }
            .totals { margin-top: 10px; }
            .total-line { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .grand-total { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }
            .footer { text-align: center; margin-top: 15px; font-size: 10px; }
            @media print {
              @page { margin: 0; }
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="store-name">Your POS Store</div>
              <div class="store-info">
                Your Store Address<br>
                Tel: Your Phone Number
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="receipt-info">
              <div>Voucher: ${sale.voucherNumber}</div>
              <div>Date: ${format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</div>
              <div>Cashier: ${sale.createdBy}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="items">
              ${sale.items.map(item => `
                <div class="item">
                  <div class="item-name">${item.productName}</div>
                  <div class="item-details">
                    <span>${item.quantity} x ${formatCurrency(item.salePrice)}</span>
                    <span>${formatCurrency(item.totalSale)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="divider"></div>
            
            <div class="totals">
              <div class="total-line">
                <span>Subtotal:</span>
                <span>${formatCurrency(sale.totalSale)}</span>
              </div>
              <div class="total-line grand-total">
                <span>TOTAL:</span>
                <span>${formatCurrency(sale.totalSale)}</span>
              </div>
              <div class="total-line">
                <span>Received:</span>
                <span>${formatCurrency(sale.receivedAmount)}</span>
              </div>
              <div class="total-line">
                <span>Change:</span>
                <span>${formatCurrency(sale.changeAmount)}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
              Thank you for your purchase!<br>
              Please come again
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    }
    
    resolve(result);
  });
}