// GeneratePdfReport.jsx
import React from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { Button } from 'reactstrap';

// 初始化 pdfMake 的字体资源
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const GeneratePdfReport = ({ title, reportContainerId }) => {
  const generatePdf = () => {
    const printableArea = document.getElementById(reportContainerId);
    if (!printableArea) {
      console.error(`找不到 id 为 "${reportContainerId}" 的区域`);
      return;
    }

    let htmlContent = printableArea.innerHTML;

    // 移除所有形如 id="collapsible-trigger-xxx" 的属性
    htmlContent = htmlContent.replace(/id="collapsible-trigger-[^"]*"/g, '');

    // 可选：移除 header 部分（假设 header 使用 .header 类）
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const headerEls = tempDiv.querySelectorAll('.header');
    headerEls.forEach(el => el.remove());
    htmlContent = tempDiv.innerHTML;

    // 在报告顶部添加标题（可根据需要调整）
    const reportHeader = `<h1>${title || 'Report'}</h1>`;
    htmlContent = reportHeader + htmlContent;

    // 将 HTML 转换为 pdfMake 可识别的格式
    const pdfContent = htmlToPdfmake(htmlContent);

    // 定义 PDF 文档结构与样式
    const docDefinition = {
      content: pdfContent,
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      styles: {
        header: { fontSize: 18, bold: true, marginBottom: 10 },
        paragraph: { fontSize: 12, margin: [0, 5, 0, 5] },
      },
    };

    // 生成 PDF 并自动下载
    pdfMake.createPdf(docDefinition).download(`${title || 'Report'}.pdf`);
  };

  return (
    <Button color="primary" onClick={generatePdf}>
      导出 PDF
    </Button>
  );
};

export default GeneratePdfReport;