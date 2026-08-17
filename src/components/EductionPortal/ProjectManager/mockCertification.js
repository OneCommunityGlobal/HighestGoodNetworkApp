export const mockEducatorCertifications = [
  {
    educator: {
      _id: 'e1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    certifications: [
      {
        _id: 'c1',
        name: 'First Aid Training',
        description: 'Basic safety and first aid response',
        status: 'active',
        expiryDate: '2026-01-01',
        assignedBy: 'Manager A',
      },
      {
        _id: 'c2',
        name: 'Teaching Methodology 101',
        description: 'Introduction to teaching methods',
        status: 'in-progress',
        expiryDate: null,
        assignedBy: 'Manager B',
      },
    ],
  },
  {
    educator: {
      _id: 'e2',
      firstName: 'Sarah',
      lastName: 'Lee',
      email: 'sarah.lee@example.com',
    },
    certifications: [
      {
        _id: 'c3',
        name: 'Child Safety',
        description: 'Child protection and safety course',
        status: 'expired',
        expiryDate: '2024-08-01',
        assignedBy: 'Manager A',
      },
    ],
  },
];
