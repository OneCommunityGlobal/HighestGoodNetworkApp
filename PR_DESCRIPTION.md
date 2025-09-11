# Add FAQ Section to Collaboration Landing Page

## 📋 Overview
This PR adds a comprehensive FAQ section to the Collaboration landing page, providing users with essential information before they apply for positions.

## ✨ Features Added

### 🎯 FAQ Section Component
- **Two-column responsive layout** with FAQ list on the left and embedded video on the right
- **Dynamic FAQ loading** from the existing FAQ API endpoint
- **Video integration** with YouTube embed for "What is it like working with us?" content
- **Content filtering** to exclude specific questions (22 & 23) from display
- **Responsive design** with proper styling and spacing

### 🔧 Technical Implementation
- Created `FAQSection.jsx` component with React hooks for state management
- Added `FAQSection.module.css` for component-specific styling
- Integrated with existing FAQ API (`getAllFAQs` from `../Faq/api`)
- Fixed import path resolution for proper module loading
- Rendered FAQ section below the main heading on Collaboration page

### 🎨 UI/UX Improvements
- **Clean two-column layout** with FAQ list (2/3 width) and video (1/3 width)
- **Numbered FAQ items** with proper typography and spacing
- **Embedded YouTube video** with responsive iframe (400x225px)
- **Consistent styling** matching the existing Collaboration page theme
- **Mobile-friendly design** with flexbox layout

## 🔗 Video Integration
- **YouTube Video**: [L7MUY0IJ4FY](https://www.youtube.com/watch?v=L7MUY0IJ4FY)
- **Embed URL**: `https://www.youtube.com/embed/L7MUY0IJ4FY`
- **Responsive iframe** with proper aspect ratio and border styling

## 📁 Files Modified/Added

### New Files:
- `src/components/Collaboration/FAQSection.jsx` - Main FAQ component
- `src/components/Collaboration/FAQSection.module.css` - Component styles

### Modified Files:
- `src/components/Collaboration/Collaboration.jsx` - Added FAQSection import and rendering

## 🚀 How It Works

1. **Data Fetching**: Component fetches FAQs from existing API endpoint
2. **Content Filtering**: Removes questions 22 & 23 from display
3. **Rendering**: Displays filtered FAQs in numbered list format
4. **Video Display**: Shows embedded YouTube video in right column
5. **Responsive Layout**: Adapts to different screen sizes

## 🎯 User Experience
- Users now see comprehensive FAQ information immediately on the Collaboration landing page
- Video content provides visual engagement and answers key questions
- Clean, organized layout makes information easy to scan and read
- Consistent with existing page design and branding

## ✅ Testing
- Component renders without errors
- FAQ data loads successfully from API
- Video embeds properly with correct aspect ratio
- Responsive design works across different screen sizes
- Questions 22 & 23 are properly filtered out

## 🔧 Technical Notes
- Uses existing FAQ API infrastructure
- Implements proper error handling with toast notifications
- Follows React best practices with hooks and functional components
- CSS modules for scoped styling
- No breaking changes to existing functionality

---

**Branch**: `VARSHA-KARANAM-FAQ-APPLICATION`  
**Type**: Feature Addition  
**Impact**: User Experience Enhancement
