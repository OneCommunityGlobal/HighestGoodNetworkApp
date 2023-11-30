import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import { ProjectMemberTable } from '../ProjectMemberTable';

describe('ProjectMemberTable', () => {
    const mockMembers = {
        fetched: true,
        foundUsers: [
            { _id: '1', firstName: 'John', lastName: 'Doe', active: true },
            { _id: '2', firstName: 'Jane', lastName: 'Smith', active: false }
        ],
        members: [
            { _id: '1', firstName: 'John', lastName: 'Doe', active: true },
            { _id: '2', firstName: 'Jane', lastName: 'Smith', active: false }
        ]
    };
    const mockHandleMemberCount = jest.fn();

    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <ProjectMemberTable projectMembers={mockMembers} skip={0} take={10} handleMemberCount={mockHandleMemberCount} />
            </BrowserRouter>
        );
        expect(screen.getByText('Members')).toBeInTheDocument();
    });

    it('displays all members correctly', () => {
      render(
          <BrowserRouter>
              <ProjectMemberTable projectMembers={mockMembers} skip={0} take={10} handleMemberCount={mockHandleMemberCount} />
          </BrowserRouter>
      );
      mockMembers.members.forEach(member => {
          expect(screen.getByText(`${member.firstName.substring(0, 10)} ${member.lastName.substring(0, 1)}`)).toBeInTheDocument();
      });
  });
  

    it('handles pagination correctly', () => {
        render(
            <BrowserRouter>
                <ProjectMemberTable projectMembers={mockMembers} skip={0} take={1} handleMemberCount={mockHandleMemberCount} />
            </BrowserRouter>
        );
        expect(screen.queryByText(`${mockMembers.members[1].firstName} ${mockMembers.members[1].lastName}`)).not.toBeInTheDocument();
    });

    it('creates links to user profiles correctly', () => {
      render(
          <BrowserRouter>
              <ProjectMemberTable projectMembers={mockMembers} skip={0} take={10} handleMemberCount={mockHandleMemberCount} />
          </BrowserRouter>
      );
      const profileLinks = screen.getAllByTitle('View Profile');
      profileLinks.forEach((link, index) => {
          expect(link.getAttribute('href')).toBe(`/userprofile/${mockMembers.members[index]._id}`);
      });
  });

    it('calls handleMemberCount with correct number of members', () => {
        render(
            <BrowserRouter>
                <ProjectMemberTable projectMembers={mockMembers} skip={0} take={10} handleMemberCount={mockHandleMemberCount} />
            </BrowserRouter>
        );
        expect(mockHandleMemberCount).toHaveBeenCalledWith(mockMembers.members.length);
    });
});

