/**
 * Mock Data for Resource Request Management System
 * Use this for testing without a backend
 *
 * To use this in your app:
 * 1. Copy this file to src/__mocks__/resourceRequestMockData.js
 * 2. Add it to your test setup or use with Mock Service Worker
 */

export const mockResourceRequests = [
  {
    id: '1',
    educatorName: 'John Smith',
    title: 'Need projectors for outdoor lessons',
    details:
      'We require 3 high-brightness projectors for outdoor science classes. These will be used for interactive demonstrations with students. The projectors should have brightness of at least 4000 lumens and support wireless connectivity for seamless content sharing from tablets and laptops.',
    priority: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: '2',
    educatorName: 'Jane Doe',
    title: 'Request for art supplies',
    details:
      'Canvas, paints, and brushes for painting classes. We need: 50 canvas sheets (A3 size), 5 sets of acrylic paint (24 colors each), 100 brushes (various sizes), and 10 palettes for color mixing. These will support our upcoming art exhibition project.',
    priority: 'medium',
    status: 'approved',
    createdAt: new Date(Date.now() - 1209600000).toISOString(), // 14 days ago
    updatedAt: new Date(Date.now() - 1000000000).toISOString(),
  },
  {
    id: '3',
    educatorName: 'Mike Johnson',
    title: 'Laboratory equipment needed',
    details:
      'Beakers, test tubes, and safety equipment for chemistry labs. Specifically: 50 beakers (various sizes), 100 test tubes, 10 safety goggles, 5 lab coats, and 2 first aid kits. Essential for upcoming chemistry practical sessions.',
    priority: 'urgent',
    status: 'pending',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '4',
    educatorName: 'Sarah Williams',
    title: 'Sports equipment request',
    details:
      'Basketballs, volleyball nets, and training cones for physical education. We need: 12 basketballs, 3 volleyball nets, 20 training cones, and 5 agility ladder sets. This will support our PE curriculum and intramural sports programs.',
    priority: 'low',
    status: 'denied',
    createdAt: new Date(Date.now() - 1814400000).toISOString(), // 21 days ago
    updatedAt: new Date(Date.now() - 1209600000).toISOString(),
  },
  {
    id: '5',
    educatorName: 'Emily Chen',
    title: 'Computer software licenses',
    details:
      'Educational licenses for design software. We need: 30 licenses of Adobe Creative Suite, 20 licenses of Autodesk AutoCAD, and 15 licenses of Blender Pro. These are for our digital design and engineering courses.',
    priority: 'high',
    status: 'approved',
    createdAt: new Date(Date.now() - 2419200000).toISOString(), // 28 days ago
    updatedAt: new Date(Date.now() - 1209600000).toISOString(),
  },
  {
    id: '6',
    educatorName: 'Robert Martinez',
    title: 'Musical instruments for band class',
    details:
      'Various instruments needed for the school band program. List includes: 5 trumpets, 3 French horns, 4 saxophones, 2 trombones, 6 violins, and 4 cellos. All should be intermediate to advanced level.',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: '7',
    educatorName: 'Lisa Anderson',
    title: 'Library books for literature courses',
    details:
      'Classic and contemporary literature books for our English department. We need 100 copies each of: To Kill a Mockingbird, 1984, Pride and Prejudice, The Great Gatsby, and Brave New World. These will be used in our literature courses across grades 9-12.',
    priority: 'low',
    status: 'pending',
    createdAt: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 864000000).toISOString(),
  },
  {
    id: '8',
    educatorName: 'David Thompson',
    title: 'Microscopes and slides for biology',
    details:
      'Microscopes and prepared slides for advanced biology courses. We need: 15 compound microscopes (1000x magnification), 10 digital microscopes with cameras, 500 prepared microscope slides covering various cell types and organisms.',
    priority: 'urgent',
    status: 'approved',
    createdAt: new Date(Date.now() - 1209600000).toISOString(), // 14 days ago
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

/**
 * Mock API Response for GET /educator/resource-requests
 * Returns only the authenticated educator's requests
 */
export const getMockEducatorRequests = () => {
  // Simulate that educator John Smith submitted requests 1, 3
  return mockResourceRequests.filter(req => req.educatorName === 'John Smith');
};

/**
 * Mock API Response for GET /pm/resource-requests
 * Returns all requests, optionally filtered by status
 */
export const getMockPMRequests = (status = null) => {
  if (!status) {
    return mockResourceRequests;
  }
  return mockResourceRequests.filter(req => req.status === status);
};

/**
 * Mock API Response for POST /educator/resource-requests
 * Simulates creating a new request
 */
export const createMockRequest = (title, details, priority) => {
  return {
    id: Date.now().toString(),
    educatorName: 'John Smith', // In real app, would be authenticated user
    title,
    details,
    priority,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Mock API Response for PUT /pm/resource-requests/:requestId
 * Simulates updating request status
 */
export const updateMockRequestStatus = (requestId, newStatus) => {
  const request = mockResourceRequests.find(r => r.id === requestId);
  if (!request) {
    throw new Error(`Request ${requestId} not found`);
  }
  return {
    ...request,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Statistics helpers
 */
export const getMockStatistics = () => {
  return {
    total: mockResourceRequests.length,
    pending: mockResourceRequests.filter(r => r.status === 'pending').length,
    approved: mockResourceRequests.filter(r => r.status === 'approved').length,
    denied: mockResourceRequests.filter(r => r.status === 'denied').length,
  };
};

export default {
  mockResourceRequests,
  getMockEducatorRequests,
  getMockPMRequests,
  createMockRequest,
  updateMockRequestStatus,
  getMockStatistics,
};
