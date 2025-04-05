// generatePDF.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './TotalOrgSummary.css';

export function generatePDF() {
  const input = document.getElementById('pdfContent');
  
  // 添加 pdf-mode 类使打印样式生效
  input.classList.add('pdf-mode');

  // 延时确保样式生效后再截图
  setTimeout(() => {
    // 等待所有字体加载完成
    document.fonts.ready.then(() => {
      html2canvas(input, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        allowTaint: false,
        scrollY: -window.scrollY
      }).then((canvas) => {
        // 截图完成后移除 pdf-mode 类
        input.classList.remove('pdf-mode');

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // 计算图片在PDF中的显示尺寸
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

        // 如果内容超过一页，处理分页
        let heightLeft = imgHeight;
        while (heightLeft > pageHeight) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save('document.pdf');
      });
    });
  }, 100); // 延时100ms，视情况可调整
}