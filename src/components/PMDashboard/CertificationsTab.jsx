import { useState, useEffect } from 'react';
import { Button, Input, Table, Badge, Spinner } from 'reactstrap';
import styles from './PMResourceDashboard.module.css';

/**
 * CertificationsTab - Displays educator certifications with training status and expiry
 */
function CertificationsTab({ darkMode }) {
  const [certifications, setCertifications] = useState([]);
  const [filteredCertifications, setFilteredCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    teacherId: '',
    searchTerm: '',
  });

  // Mock data - Replace with actual API call when backend is ready
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockCertifications = [
        {
          id: 'CERT001',
          teacherId: 'TCH001',
          teacherName: 'John Smith',
          certificationType: 'First Aid Training',
          issueDate: '2024-06-15',
          expiryDate: '2025-06-15',
          status: 'active',
          trainingHours: 8,
          certifyingBody: 'Red Cross',
        },
        {
          id: 'CERT002',
          teacherId: 'TCH002',
          teacherName: 'Sarah Johnson',
          certificationType: 'Teaching Certification',
          issueDate: '2023-09-01',
          expiryDate: '2025-09-01',
          status: 'active',
          trainingHours: 120,
          certifyingBody: 'State Education Board',
        },
        {
          id: 'CERT003',
          teacherId: 'TCH001',
          teacherName: 'John Smith',
          certificationType: 'Child Protection Training',
          issueDate: '2024-01-10',
          expiryDate: '2025-01-10',
          status: 'expiring_soon',
          trainingHours: 4,
          certifyingBody: 'Child Safety Institute',
        },
        {
          id: 'CERT004',
          teacherId: 'TCH003',
          teacherName: 'Michael Brown',
          certificationType: 'Laboratory Safety',
          issueDate: '2023-03-20',
          expiryDate: '2024-03-20',
          status: 'expired',
          trainingHours: 16,
          certifyingBody: 'Safety Council',
        },
        {
          id: 'CERT005',
          teacherId: 'TCH004',
          teacherName: 'Emily Davis',
          certificationType: 'Special Education Certification',
          issueDate: '2024-08-15',
          expiryDate: '2026-08-15',
          status: 'active',
          trainingHours: 200,
          certifyingBody: 'Special Education Board',
        },
        {
          id: 'CERT006',
          teacherId: 'TCH002',
          teacherName: 'Sarah Johnson',
          certificationType: 'Digital Teaching Tools',
          issueDate: '2024-10-01',
          expiryDate: '2025-10-01',
          status: 'active',
          trainingHours: 12,
          certifyingBody: 'EdTech Institute',
        },
        {
          id: 'CERT007',
          teacherId: 'TCH005',
          teacherName: 'David Wilson',
          certificationType: 'First Aid Training',
          issueDate: '2024-11-01',
          expiryDate: '2025-12-15',
          status: 'expiring_soon',
          trainingHours: 8,
          certifyingBody: 'Red Cross',
        },
      ];
      setCertifications(mockCertifications);
      setFilteredCertifications(mockCertifications);
      setLoading(false);
    }, 800);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...certifications];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(cert => cert.status === filters.status);
    }

    // Filter by teacher ID
    if (filters.teacherId.trim()) {
      filtered = filtered.filter(cert =>
        cert.teacherId.toLowerCase().includes(filters.teacherId.toLowerCase()),
      );
    }

    // Filter by search term
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        cert =>
          cert.teacherName.toLowerCase().includes(searchLower) ||
          cert.certificationType.toLowerCase().includes(searchLower) ||
          cert.certifyingBody.toLowerCase().includes(searchLower),
      );
    }

    setFilteredCertifications(filtered);
  }, [filters, certifications]);

  const getStatusBadge = status => {
    const statusConfig = {
      active: { color: 'success', label: 'ACTIVE' },
      expiring_soon: { color: 'warning', label: 'EXPIRING SOON' },
      expired: { color: 'danger', label: 'EXPIRED' },
    };
    const config = statusConfig[status] || { color: 'secondary', label: status.toUpperCase() };
    return (
      <Badge color={config.color} className={styles.statusBadge}>
        {config.label}
      </Badge>
    );
  };

  const getDaysUntilExpiry = expiryDate => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryWarning = expiryDate => {
    const daysLeft = getDaysUntilExpiry(expiryDate);
    if (daysLeft < 0) {
      return (
        <span className={styles.expiryWarningExpired}>Expired {Math.abs(daysLeft)} days ago</span>
      );
    }
    if (daysLeft <= 30) {
      return <span className={styles.expiryWarningSoon}>Expires in {daysLeft} days</span>;
    }
    return <span className={styles.expiryNormal}>Expires in {daysLeft} days</span>;
  };

  const handleExportSummary = () => {
    // Prepare CSV data
    const csvHeaders = [
      'Certification ID',
      'Teacher ID',
      'Teacher Name',
      'Certification Type',
      'Issue Date',
      'Expiry Date',
      'Status',
      'Training Hours',
      'Certifying Body',
    ];

    const csvRows = filteredCertifications.map(cert => [
      cert.id,
      cert.teacherId,
      cert.teacherName,
      cert.certificationType,
      cert.issueDate,
      cert.expiryDate,
      cert.status,
      cert.trainingHours,
      cert.certifyingBody,
    ]);

    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `training_summary_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner color="primary" />
        <p>Loading certifications...</p>
      </div>
    );
  }

  return (
    <div className={styles.tabPanel}>
      {/* Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterRow}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel} htmlFor="cert-status-filter">
              Status:
            </label>
            <Input
              id="cert-status-filter"
              type="select"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className={styles.filterInput}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </Input>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel} htmlFor="cert-teacher-filter">
              Teacher ID:
            </label>
            <Input
              id="cert-teacher-filter"
              type="text"
              placeholder="Search by Teacher ID"
              value={filters.teacherId}
              onChange={e => setFilters({ ...filters, teacherId: e.target.value })}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel} htmlFor="cert-search-filter">
              Search:
            </label>
            <Input
              id="cert-search-filter"
              type="text"
              placeholder="Search certifications..."
              value={filters.searchTerm}
              onChange={e => setFilters({ ...filters, searchTerm: e.target.value })}
              className={styles.filterInput}
            />
          </div>

          <Button
            color="secondary"
            onClick={() => setFilters({ status: 'all', teacherId: '', searchTerm: '' })}
            className={styles.clearFiltersBtn}
          >
            Clear Filters
          </Button>

          <Button color="primary" onClick={handleExportSummary} className={styles.exportBtn}>
            📥 Export Summary
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        <p>
          Showing <strong>{filteredCertifications.length}</strong> of{' '}
          <strong>{certifications.length}</strong> certifications
        </p>
      </div>

      {/* Certifications Table */}
      <div className={styles.tableContainer}>
        <Table
          responsive
          striped
          className={`${styles.resourceTable} ${darkMode ? styles.resourceTableDark : ''}`}
        >
          <thead>
            <tr>
              <th>Cert ID</th>
              <th>Teacher ID</th>
              <th>Teacher Name</th>
              <th>Certification Type</th>
              <th>Certifying Body</th>
              <th>Training Hours</th>
              <th>Issue Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Days Until Expiry</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertifications.length === 0 ? (
              <tr>
                <td colSpan="10" className={styles.noResults}>
                  No certifications found matching the filters.
                </td>
              </tr>
            ) : (
              filteredCertifications.map(cert => (
                <tr key={cert.id}>
                  <td className={styles.certId}>{cert.id}</td>
                  <td>{cert.teacherId}</td>
                  <td>{cert.teacherName}</td>
                  <td>{cert.certificationType}</td>
                  <td>{cert.certifyingBody}</td>
                  <td>{cert.trainingHours}h</td>
                  <td>{new Date(cert.issueDate).toLocaleDateString()}</td>
                  <td>{new Date(cert.expiryDate).toLocaleDateString()}</td>
                  <td>{getStatusBadge(cert.status)}</td>
                  <td>{getExpiryWarning(cert.expiryDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default CertificationsTab;
