import { useState, useEffect } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiTrash2,
  FiCopy,
  FiEdit,
  FiDownload,
} from 'react-icons/fi';
import styles from './IssueDashboard.module.css';
import {
  Col,
  Row,
  Table,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  copyIssue,
  deleteIssue,
  fetchAllIssues,
  renameIssue,
} from '~/actions/bmdashboard/issueActions';
import IssueHeader from './IssueHeader';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';

export default function IssueDashboard() {
  const dispatch = useDispatch();
  const issues = useSelector(state => state.bmIssues?.issues || []);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(null);
  const itemsPerPage = 5;
  const displayIssues = issues;
  const totalPages = Math.ceil(displayIssues.length / itemsPerPage);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const currentItems = displayIssues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleMenu = id => setMenuOpen(open => (open === id ? null : id));

  const openDeleteModal = issue => {
    setSelectedIssue(issue);
    setShowDeleteModal(true);
  };

  const openRenameModal = issue => {
    setSelectedIssue(issue);
    setRenameValue(issue.name);
    setShowRenameModal(true);
  };

  const openCopyModal = issue => {
    setSelectedIssue(issue);
    setShowCopyModal(true);
  };

  const confirmDelete = () => {
    dispatch(deleteIssue(selectedIssue._id));
    setShowDeleteModal(false);
    setSelectedIssue(null);
  };

  const confirmCopy = () => {
    dispatch(copyIssue(selectedIssue._id));
    setShowCopyModal(false);
    setSelectedIssue(null);
  };

  const confirmRename = () => {
    if (renameValue.trim() !== '') {
      dispatch(renameIssue(selectedIssue._id, renameValue.trim()));
      setShowRenameModal(false);
      setSelectedIssue(null);
    }
  };

  useEffect(() => {
    dispatch(fetchAllIssues());
  }, [dispatch]);

  const buildExportRows = sourceIssues => {
    return (sourceIssues || []).map(issue => {
      const assignedUser = issue.assignedTo
        ? `${issue.assignedTo.firstName || ''} ${issue.assignedTo.lastName || ''}`.trim()
        : issue.assignedToName || issue.assignee || 'Unassigned';

      const formatDate = value => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return `${value}`;
        return date.toLocaleDateString();
      };

      return {
        issueName: issue.name || issue.issueName || '-',
        status: issue.status || issue.state || issue.issueStatus || '-',
        priority: issue.priority || issue.severity || issue.issuePriority || '-',
        assignedUser: assignedUser || '-',
        createdDate: formatDate(
          issue.createdDate || issue.createdAt || issue.openDate || issue.dateCreated,
        ),
        lastUpdated: formatDate(issue.updatedDate || issue.updatedAt || issue.lastUpdated),
      };
    });
  };

  const exportHeaders = [
    'Issue Name',
    'Status',
    'Priority',
    'Assigned User',
    'Created Date',
    'Last Updated',
  ];

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const exportRows = buildExportRows(displayIssues);
    if (exportRows.length === 0) {
      toast.info('No issues available to export.');
      return;
    }
    const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      exportHeaders,
      ...exportRows.map(row => [
        row.issueName || '-',
        row.status || '-',
        row.priority || '-',
        row.assignedUser || '-',
        row.createdDate || '-',
        row.lastUpdated || '-',
      ]),
    ];

    const csvContent = rows.map(row => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `issues-export-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Issue export generated (CSV).');
  };

  const handleExportPdf = () => {
    const exportRows = buildExportRows(displayIssues);
    if (exportRows.length === 0) {
      toast.info('No issues available to export.');
      return;
    }
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const startX = 40;
    const startY = 50;
    const rowHeight = 18;
    const colWidths = [160, 70, 70, 110, 80, 80];
    const truncate = (text, maxWidth) => {
      if (doc.getTextWidth(text) <= maxWidth) return text;
      let truncated = text;
      while (truncated.length > 0 && doc.getTextWidth(`${truncated}…`) > maxWidth) {
        truncated = truncated.slice(0, -1);
      }
      return `${truncated}…`;
    };

    doc.setFontSize(12);
    doc.text('Issue Export', startX, startY - 20);
    doc.setFontSize(9);

    let x = startX;
    exportHeaders.forEach((header, index) => {
      const width = colWidths[index];
      doc.text(truncate(header, width - 4), x, startY);
      x += width;
    });

    let y = startY + rowHeight;
    exportRows.forEach(row => {
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 50;
      }
      const values = [
        row.issueName || '-',
        row.status || '-',
        row.priority || '-',
        row.assignedUser || '-',
        row.createdDate || '-',
        row.lastUpdated || '-',
      ];
      let colX = startX;
      values.forEach((value, index) => {
        const width = colWidths[index];
        doc.text(truncate(String(value ?? ''), width - 4), colX, y);
        colX += width;
      });
      y += rowHeight;
    });

    const filename = `issues-export-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    toast.success('Issue export generated (PDF).');
  };

  function getTimeSince(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w`;
    const months = Math.floor(days / 30);
    return `${months}mo`;
  }

  return (
    <div
      className={`container-fluid issue-dashboard min-vh-100 p-4 ${
        darkMode ? 'bg-oxford-blue text-light' : ''
      }`}
    >
      <div>
        <IssueHeader />
      </div>
      <Row className="mb-3">
        <Col>
          <h4 className={`fw-semibold ${darkMode ? 'text-light' : ''}`}>Issue Dashboard</h4>
        </Col>
        <Col className="d-flex justify-content-end">
          <UncontrolledDropdown>
            <DropdownToggle tag="button" className="btn btn-sm btn-primary" type="button">
              <FiDownload className="me-2" />
              Export
            </DropdownToggle>
            <DropdownMenu end className={`${darkMode ? styles.exportDropdownMenuDark : ''}`}>
              <DropdownItem
                onClick={handleExportCsv}
                className={`${darkMode ? styles.exportDropdownItemDark : ''}`}
              >
                Export as CSV
              </DropdownItem>
              <DropdownItem
                onClick={handleExportPdf}
                className={`${darkMode ? styles.exportDropdownItemDark : ''}`}
              >
                Export as PDF
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Col>
      </Row>

      <div className={`${styles.issuesTableResponsive}`}>
        <Table hover className={`mb-0 ${darkMode ? 'table-dark' : ''}`}>
          <thead className={darkMode ? 'table-dark' : 'table-light'}>
            <tr>
              <th className={`${styles.textEnd}`}>Issue Name </th>
              <th className={`${styles.textEnd}`}>Open since</th>
              <th className={`${styles.textEnd}`}>Category</th>
              <th className={`${styles.textEnd}`}>Person dealing</th>
              <th className={`${styles.textEnd}`}>Cost due to Issue</th>
              <th className={`${styles.textEnd}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(issue => {
              const openSince = issue.openDate ? getTimeSince(issue.openDate) : '-';
              const category = Array.isArray(issue.category)
                ? issue.category.join(', ')
                : issue.category || '-';
              const assignedTo = issue.assignedTo
                ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
                : 'Unassigned';
              const cost = issue.totalCost != null ? `$${issue.totalCost}` : 'N/A';

              return (
                <tr key={issue._id}>
                  <td className={`fw-medium ${darkMode ? 'text-light' : ''}`}>{issue.name}</td>
                  <td className={darkMode ? 'text-light' : ''}>{openSince}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.bgInfo} text-dark`}>{category}</span>
                  </td>
                  <td className={darkMode ? 'text-light' : ''}>{assignedTo}</td>
                  <td className={darkMode ? 'text-light' : ''}>{cost}</td>
                  <td className={`${styles.textEnd} position-relative`}>
                    <div className={`issue-dashboard-dropdown  ${darkMode ? 'bg-oxide-blue' : ''}`}>
                      <button
                        type="button"
                        aria-label="Actions menu"
                        className={`btn btn-sm ${styles.btnLink}`}
                        onClick={() => toggleMenu(issue._id)}
                      >
                        <FiMoreHorizontal size={18} />
                      </button>

                      {menuOpen === issue._id && (
                        <div
                          className={`issue-dashboard-dropdown-menu show ${styles.actionMenu} ${
                            darkMode ? styles.actionMenuDark : ''
                          } ${
                            currentItems.indexOf(issue) === currentItems.length - 1
                              ? ' last-row-menu'
                              : ''
                          }`}
                        >
                          <button
                            type="button"
                            className={`${styles.issueDashboardDropdownItem}`}
                            onClick={() => {
                              openRenameModal(issue);
                              setMenuOpen(null);
                            }}
                          >
                            <FiEdit size={14} className="me-2" />
                            Rename
                          </button>
                          <button
                            type="button"
                            className={`${styles.issueDashboardDropdownItem}`}
                            onClick={() => {
                              openCopyModal(issue);
                              setMenuOpen(null);
                            }}
                          >
                            <FiCopy size={14} className="me-2" />
                            Copy
                          </button>
                          <button
                            type="button"
                            className={`${styles.issueDashboardDropdownItem} text-danger`}
                            onClick={() => {
                              openDeleteModal(issue);
                              setMenuOpen(null);
                            }}
                          >
                            <FiTrash2 size={14} className="me-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {issues.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className={`text-center py-4 ${darkMode ? 'text-light' : 'text-muted'}`}
                >
                  No issues found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <div
        className={`card-footer d-flex justify-content-between align-items-center ${
          darkMode ? 'bg-space-cadet text-light' : 'bg-light text-muted'
        }`}
      >
        <div className={`small ${darkMode ? 'text-light' : ''}`}>
          Showing {currentItems.length} of {issues.length} issues
        </div>
        <nav aria-label="Issue pagination">
          <ul className={`${styles.pagination} pagination-sm mb-0`}>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className={`page-link ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                aria-label="Previous"
              >
                <FiChevronLeft size={16} />
              </button>
            </li>

            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                type="button"
                className={`page-link ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                aria-label="Next"
              >
                <FiChevronRight size={16} />
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className={`${styles.issuesModalBackdrop}`}>
          <div className={`modal-dialog `}>
            <div className={`modal-content p-3 ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>
              <h5>Rename Issue</h5>
              <input
                type="text"
                className="form-control my-2"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
              />
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  className="btn btn-secondary mx-3"
                  onClick={() => setShowRenameModal(false)}
                  type="button"
                  label="Cancel Button"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmRename}
                  type="button"
                  label="Rename Button"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={`${styles.issuesModalBackdrop}`}>
          <div className={`modal-dialog ${darkMode ? 'bg-dark text-light' : ''}`}>
            <div className={`modal-content p-3 ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>
              <h5>Confirm Delete</h5>
              <p className={`${darkMode ? 'text-light' : ''}`}>
                Are you sure you want to delete <strong>{selectedIssue.name}</strong>?
              </p>
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  className="btn btn-secondary mx-3"
                  onClick={() => setShowDeleteModal(false)}
                  type="button"
                  label="Cancel Button"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  type="button"
                  label="Delete Button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Modal */}
      {showCopyModal && (
        <div className={`${styles.issuesModalBackdrop}`}>
          <div className={`modal-dialog ${darkMode ? 'bg-dark text-light' : ''}`}>
            <div className={`modal-content p-3 ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>
              <h5>Confirm Copy</h5>
              <p className={`${darkMode ? 'text-light' : ''}`}>
                Are you sure you want to copy <strong>{selectedIssue.name}</strong>?
              </p>
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  className="btn btn-secondary mx-3"
                  onClick={() => setShowCopyModal(false)}
                  type="button"
                  label="Cancel Button"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmCopy}
                  type="button"
                  label="Copy Button"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
