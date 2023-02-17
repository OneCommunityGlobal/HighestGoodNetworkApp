/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable arrow-parens */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from 'react';
import TagSent from './TagSent';
import './TagsSearch.css';

function TagsSearch({ placeholder, members, addResources, removeResource }) {
  const [tags, setTags] = useState([]);
  const [isHidden, setIsHidden] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [taskMembers, setTaskMembers] = useState([])

  // Se tiver como usar a tag aqui no lugar de indexToRemove seria melhor
  // Pq se tiver outro component com o msm numero eles podem ser filtrados ao mesmo tempo
  const removeTags = indexToRemove => {
    const membersIdToRemove = taskMembers.map((member) => {
      if(`${member.firstName} ${member.lastName}` === tags[indexToRemove]){
        return member._id;
      }
    })
    removeResource(membersIdToRemove);
    setTaskMembers(taskMembers.filter((member) => 
      `${member.firstName} ${member.lastName}` !== tags[indexToRemove]));
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const addTags = event => {
    if (event.key === 'Enter' && event.target.value !== '') {
      setTags([...tags, event.target.value]);
      event.target.value = '';
    }
  };

  const handleClick = event => {
    setTags([...tags, event.target.innerText]);
    const newMember = members.map(member =>{ 
      if(`${member.firstName} ${member.lastName}` == event.target.innerText) {
        setTaskMembers([...taskMembers, member]);
        addResources(member._id, member.firstName, member.lastName);
      }});
    
    event.target.value = '';
    setIsHidden(!isHidden);
  };

  const handleFilter = event => {
    const searchWord = event.target.value;
    // const noRepeatTags = members.filter(e => !tags.includes(e.firstName));
    const newFilter = members.filter(member =>
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchWord.toLowerCase()),
    );
    if (searchWord === '') {
      setFilteredData([]);
    } else {
      setIsHidden(false);
      setFilteredData(newFilter);
    }
  };

  return (
    <div className="container-fluid d-flex flex-column px-0">
      <div className="d-flex flex-column container-fluid mb-1 px-0">
        <div className="align-items-start justify-content-start w-100 px-0 position-relative">
          <input
            type="text"
            placeholder={placeholder}
            className="border border-dark rounded form-control px-2"
            onKeyUp={e => (e.key === 'Enter' ? addTags(e) : null)}
            onChange={handleFilter}
          />
          {filteredData.length !== 0 ? (
            <ul
              className={`my-element ${
                isHidden
                  ? 'd-none'
                  : 'dropdown-menu d-flex flex-column align-items-start justify-content-start w-auto scrollbar shadow-lg rounded-3 position-absolute top-8 start-0 z-3 bg-light'
              }`}
            >
              {filteredData.slice(0, 10).map((value, index) => (
                <a href={value.link} key={value._id} className="text-decoration-none w-100">
                  <li
                    className={
                      index === selectedIndex
                        ? 'dropdown-item border-bottom fs-6 w-100 p-1'
                        : 'dropdown-item border-bottom fs-6 w-100 p-1'
                    }
                    onClick={handleClick}
                  >
                    {value.firstName + ' ' + value.lastName}
                  </li>
                </a>
              ))}
            </ul>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className="d-flex flex-wrap align-items-start justify-content-start">
        {tags.map((tag, index) => (
          <ul className="d-flex align-items-start justify-content-start m-0 p-1">
            <TagSent titleName={tag} key={index} removeTags={() => removeTags(index)} />
          </ul>
        ))}
      </div>
    </div>
  );
}

export default TagsSearch;
