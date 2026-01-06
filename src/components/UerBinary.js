import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./UserBinaryTree.css";
import API_BASE_URL from "./ApiConfig";

const UserBinaryTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [viewMode, setViewMode] = useState("default");
  const [maxLevel, setMaxLevel] = useState(2);
  const [levelOptions, setLevelOptions] = useState([1, 2, 3, 4, 5, 6]);
  const [searchPaths, setSearchPaths] = useState([]);
  
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const [showEmptySlots, setShowEmptySlots] = useState(false);
  const [emptySlots, setEmptySlots] = useState([]);
  const [emptySlotsSort, setEmptySlotsSort] = useState("level");
  
  const treeWrapperRef = useRef(null);
  const nodeRefs = useRef({});
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const userId = userData.userids?.myuserid;
        
        if (!userId) {
          setError("User ID not found in localStorage");
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `${API_BASE_URL}/user-downline?userId=${userId}`
        );
        setTreeData(response.data);
        
        const users = [];
        const extractUsers = (node) => {
          if (node) {
            users.push({
              name: node.name,
              userId: node.userId,
              id: node.userId
            });
            if (node.children) {
              node.children.forEach(child => extractUsers(child));
            }
          }
        };
        extractUsers(response.data);
        setAllUsers(users);
        
        const defaultExpanded = {};
        const initExpandedNodes = (node, level = 0) => {
          if (node) {
            if (level < 2) {
              defaultExpanded[node.userId] = true;
            }
            if (node.children) {
              node.children.forEach(child => initExpandedNodes(child, level + 1));
            }
          }
        };
        initExpandedNodes(response.data);
        setExpandedNodes(defaultExpanded);
        
        const maxPossibleLevel = calculateMaxTreeDepth(response.data);
        if (maxPossibleLevel > 0) {
          const newLevelOptions = Array.from({ length: maxPossibleLevel }, (_, i) => i + 1);
          setLevelOptions(newLevelOptions);
        }

        calculateEmptySlots(response.data);
      } catch (err) {
        console.error("Error fetching tree data:", err);
        setError("No Binary Tree Found!!");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTreeData();
  }, []);

  const calculateMaxTreeDepth = (node, currentDepth = 1) => {
    if (!node || !node.children || node.children.length === 0) {
      return currentDepth;
    }
    
    return Math.max(
      ...node.children.map(child => calculateMaxTreeDepth(child, currentDepth + 1))
    );
  };

  const calculateEmptySlots = (rootNode) => {
    const slots = [];
    
    const findEmptySlots = (node, level = 0) => {
      if (!node) return;
      
      if (!node.children || node.children.length === 0) {
        slots.push({
          parentName: node.name,
          parentId: node.userId,
          level: level + 1,
          availablePositions: ["left", "right"]
        });
      } else if (node.children.length === 1) {
        const existingChild = node.children[0];
        const existingPosition = existingChild.position || "left";
        const emptyPosition = existingPosition === "left" ? "right" : "left";
        
        slots.push({
          parentName: node.name,
          parentId: node.userId,
          level: level + 1,
          availablePositions: [emptyPosition]
        });
      }
      
      if (node.children) {
        node.children.forEach(child => findEmptySlots(child, level + 1));
      }
    };
    
    findEmptySlots(rootNode);
    setEmptySlots(slots);
  };

  const getSortedEmptySlots = () => {
    const sorted = [...emptySlots];
    
    if (emptySlotsSort === "level") {
      sorted.sort((a, b) => a.level - b.level);
    } else if (emptySlotsSort === "name") {
      sorted.sort((a, b) => a.parentName.localeCompare(b.parentName));
    }
    
    return sorted;
  };

  const scrollToUser = (userId, callback) => {
    const attemptScroll = (attempt = 0) => {
      const nodeElement = nodeRefs.current[userId];
      if (nodeElement && treeWrapperRef.current) {
        const wrapper = treeWrapperRef.current;
        
        const targetScrollLeft = nodeElement.offsetLeft - (wrapper.clientWidth / 2) + (nodeElement.offsetWidth / 2);
        const targetScrollTop = nodeElement.offsetTop - (wrapper.clientHeight / 2) + (nodeElement.offsetHeight / 2);
        
        const maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
        const maxScrollTop = wrapper.scrollHeight - wrapper.clientHeight;
        
        const finalScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
        const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
        
        try {
          wrapper.scrollTo({
            left: finalScrollLeft,
            top: finalScrollTop,
            behavior: 'smooth'
          });
        } catch (e) {
          wrapper.scrollLeft = finalScrollLeft;
          wrapper.scrollTop = finalScrollTop;
        }
        
        if (callback) {
          setTimeout(callback, 800);
        }
      } else if (attempt < 5) {
        setTimeout(() => attemptScroll(attempt + 1), 200);
      }
    };
    
    requestAnimationFrame(() => {
      setTimeout(() => attemptScroll(), 100);
    });
  };

  const navigateToUser = (userId) => {
    const findUserPath = (node, targetId, path = []) => {
      if (!node) return null;
      
      const currentPath = [...path, node];
      
      if (node.userId === targetId) {
        return currentPath;
      }
      
      if (node.children) {
        for (const child of node.children) {
          const result = findUserPath(child, targetId, currentPath);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    const userPath = findUserPath(treeData, userId);
    
    if (userPath) {
      setViewMode("custom");
      const newExpandedNodes = {...expandedNodes};
      userPath.forEach(pathNode => {
        newExpandedNodes[pathNode.userId] = true;
      });
      setExpandedNodes(newExpandedNodes);
      
      setSearchResults([userPath]);
      setSearchPaths([userPath.map(node => node.userId)]);
      
      setShowEmptySlots(false);
      
      setTimeout(() => {
        scrollToUser(userId);
      }, 300);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedSuggestionIndex(-1);
    
    if (value.trim().length > 0) {
      const suggestions = allUsers.filter(user => 
        user.name.toLowerCase().includes(value.trim().toLowerCase()) ||
        user.userId.toLowerCase().includes(value.trim().toLowerCase())
      ).slice(0, 10);
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(searchSuggestions[selectedSuggestionIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const selectSuggestion = (user) => {
    setSearchTerm(user.name);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    performSearch(user.name, user.userId);
  };

  const performSearch = (searchValue, targetUserId = null) => {
    const trimmedSearchValue = searchValue.trim();
    
    if (!trimmedSearchValue) {
      setSearchResults([]);
      setSearchPaths([]);
      return;
    }

    const results = [];
    const paths = [];
    const searchInTree = (node, path = []) => {
      if (!node) return;
      
      const currentPath = [...path, node];
      
      const matchesSearch = targetUserId ? 
        node.userId === targetUserId :
        (node.name.toLowerCase().includes(trimmedSearchValue.toLowerCase()) || 
         node.userId.toLowerCase().includes(trimmedSearchValue.toLowerCase()));
      
      if (matchesSearch) {
        results.push([...currentPath]);
        paths.push(currentPath.map(node => node.userId));
        
        setViewMode("custom");
        const newExpandedNodes = {...expandedNodes};
        currentPath.forEach(pathNode => {
          newExpandedNodes[pathNode.userId] = true;
        });
        setExpandedNodes(newExpandedNodes);
      }
      
      if (node.children) {
        node.children.forEach(child => searchInTree(child, currentPath));
      }
    };
    
    searchInTree(treeData);
    setSearchResults(results);
    setSearchPaths(paths);
    
    if (results.length > 0) {
      const firstResult = results[0];
      const highlightedNodeId = firstResult[firstResult.length - 1].userId;
      
      setTimeout(() => {
        scrollToUser(highlightedNodeId);
      }, 300);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      alert("Please enter a search term");
      return;
    }
    
    setShowSuggestions(false);
    performSearch(searchTerm);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!treeData) return;
    
    let newExpandedNodes = {};
    
    const processNode = (node, level = 0) => {
      if (!node) return;
      
      if (viewMode === "full") {
        newExpandedNodes[node.userId] = true;
      } else if (viewMode === "default") {
        newExpandedNodes[node.userId] = level < maxLevel;
      }
      
      if (node.children) {
        node.children.forEach(child => processNode(child, level + 1));
      }
    };
    
    processNode(treeData);
    
    if (viewMode === "custom") {
      newExpandedNodes = {...expandedNodes};
    }
    
    setExpandedNodes(newExpandedNodes);
  }, [viewMode, maxLevel, treeData]);

  const toggleNode = (userId) => {
    setViewMode("custom");
    setExpandedNodes(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const showFullTree = () => {
    setViewMode("full");
  };

  const showUpToLevel = (level) => {
    setMaxLevel(level);
    setViewMode("default");
  };

  const collapseTree = () => {
    setMaxLevel(1);
    setViewMode("default");
  };

  const showEmptySlotsModal = () => {
    setShowEmptySlots(true);
  };

  const isHighlighted = (node) => {
    return searchResults.some(path => 
      path.some(pathNode => pathNode.userId === node.userId)
    );
  };

  const isInSearchPath = (nodeId) => {
    return searchPaths.some(path => path.includes(nodeId));
  };

  const renderEmptyNode = (position) => {
    const nodeClass = position === "left" ? "empty-node-placeholder left-side" : "empty-node-placeholder right-side";
    
    return (
      <div className={nodeClass}></div>
    );
  };

  const colors = {
    primary: '#1e88e5',
    secondary: '#5e35b1',
    accent: '#00acc1',
    lightBg: '#e3f2fd',
    text: '#263238',
    white: '#ffffff',
    note: '#f9a825'
  };

  const renderTree = (node, level = 0, parentNode = null, position = null) => {
    if (!node) return null;
    
    const isExpanded = expandedNodes[node.userId];
    const isNodeHighlighted = isHighlighted(node);
    const isPathNode = isInSearchPath(node.userId);
    const hasChildren = node.children && node.children.length > 0;
    
    let nodeClass = "user-box compact-node";
    if (level === 0) nodeClass += " root-node";
    else if (position === "left") nodeClass += " left-node";
    else if (position === "right") nodeClass += " right-node";
    if (isNodeHighlighted) nodeClass += " highlighted";
    if (isPathNode && !isNodeHighlighted) nodeClass += " path-node";

    return (
      <div 
        className="tree-node" 
        data-level={level}
        ref={el => nodeRefs.current[node.userId] = el}
      >
        <div className={nodeClass}>
          <div className="user-details">
            <span className="user-name compact-name">{node.name}</span>
          </div>
          
          {hasChildren && (
            <button 
              className="toggle-button compact-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.userId);
              }}
            >
              {isExpanded ? "−" : "+"}
            </button>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="node-children">
            <div className="children-container compact-container">
              {node.children.length === 2 ? (
                node.children.map((child, index) => (
                  <div key={child.userId} className="child-wrapper">
                    {renderTree(
                      child, 
                      level + 1, 
                      node, 
                      index === 0 ? "left" : "right"
                    )}
                  </div>
                ))
              ) : node.children.length === 1 ? (
                <>
                  {node.children[0].position === "right" ? (
                    <>
                      <div className="child-wrapper">
                        {renderEmptyNode("left")}
                      </div>
                      <div className="child-wrapper">
                        {renderTree(node.children[0], level + 1, node, "right")}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="child-wrapper">
                        {renderTree(node.children[0], level + 1, node, "left")}
                      </div>
                      <div className="child-wrapper">
                        {renderEmptyNode("right")}
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading your network structure...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p>⚠️ {error}</p>
    </div>
  );
  
  if (!treeData) return (
    <div className="empty-container">
      <p>No network structure data available</p>
    </div>
  );

  return (
    <div className="binary-tree-container">
      <h2 className="network-title">Your Network Structure</h2>

      <div className="row mb-4">
        <div className="col-12">
          <div className="alert d-flex align-items-center py-3" style={{
            backgroundColor: colors.lightBg,
            border: `1px solid ${colors.note}`,
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <i className="bi bi-info-circle-fill me-2" style={{ color: colors.note, fontSize: '20px' }}></i>
            <span style={{ fontWeight: '500', color: colors.text }}>
              Note: The earnings data displayed reflects only the most recent day's earnings and gets refreshed every day.
            </span>
          </div>
        </div>
      </div>

      <div className="controls-container">
        <div className="search-control">
          <form onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
                className="search-input"
                autoComplete="off"
              />
              <button type="submit" className="search-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              
              {showSuggestions && searchSuggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="search-suggestions"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {searchSuggestions.map((user, index) => (
                    <div
                      key={user.userId}
                      className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                      onClick={() => selectSuggestion(user)}
                      style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        borderBottom: index < searchSuggestions.length - 1 ? '1px solid #eee' : 'none',
                        backgroundColor: index === selectedSuggestionIndex ? '#f0f8ff' : 'transparent'
                      }}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      <div style={{ fontWeight: '600', color: '#333' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>ID: {user.userId}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="view-controls">
          <button 
            className={`control-button ${viewMode === "full" ? "active" : ""}`}
            onClick={showFullTree}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Show Full Tree
          </button>
          
          <div className="level-select-wrapper">
            <select 
              value={maxLevel} 
              onChange={(e) => showUpToLevel(parseInt(e.target.value))}
              className="level-select"
            >
              {levelOptions.map(level => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className={`control-button ${viewMode === "default" && maxLevel === 1 ? "active" : ""}`}
            onClick={collapseTree}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Collapse Tree
          </button>

          <button 
            className="control-button empty-slots-button"
            onClick={showEmptySlotsModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Empty Slots ({emptySlots.length})
          </button>
        </div>
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <span className="legend-marker left-marker"></span>
          <span>Left Position</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker right-marker"></span>
          <span>Right Position</span>
        </div>
        {searchResults.length > 0 && (
          <>
            <div className="legend-item">
              <span className="legend-marker search-marker"></span>
              <span>Search Result</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker path-marker"></span>
              <span>Path to Result</span>
            </div>
          </>
        )}
      </div>
      
      <div className="binary-tree-wrapper" ref={treeWrapperRef}>
        <div className="binary-tree">
          {renderTree(treeData)}
        </div>
      </div>
      
      {searchResults.length > 0 && (
        <div className="search-results">
          <p>Found {searchResults.length} result(s)</p>
        </div>
      )}

      {showEmptySlots && (
        <div className="modal-overlay" onClick={() => setShowEmptySlots(false)}>
          <div className="empty-slots-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Available Empty Slots</h3>
              <button 
                className="modal-close-button"
                onClick={() => setShowEmptySlots(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-controls">
              <div className="sort-control">
                <label htmlFor="sort-select">Sort by:</label>
                <select 
                  id="sort-select"
                  value={emptySlotsSort} 
                  onChange={(e) => setEmptySlotsSort(e.target.value)}
                  className="sort-select"
                >
                  <option value="level">Level</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
              <div className="slots-count">
                Total Empty Slots: {emptySlots.length}
              </div>
            </div>

            <div className="empty-slots-list">
              {getSortedEmptySlots().map((slot, index) => (
                <div key={`${slot.parentId}-${index}`} className="empty-slot-item">
                  <div className="slot-info">
                    <div className="slot-parent">
                      <span className="parent-name">{slot.parentName}</span>
                      <span className="parent-id">ID: {slot.parentId}</span>
                    </div>
                    <div className="slot-details">
                      <span className="slot-level">Level {slot.level}</span>
                      <div className="available-positions">
                        {slot.availablePositions.map(position => (
                          <span 
                            key={position} 
                            className={`position-badge ${position}`}
                          >
                            {position.charAt(0).toUpperCase() + position.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="go-to-user-button"
                    onClick={() => navigateToUser(slot.parentId)}
                  >
                    Go to User
                  </button>
                </div>
              ))}
            </div>

            {emptySlots.length === 0 && (
              <div className="no-empty-slots">
                <p>No empty slots available in your network.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBinaryTree;