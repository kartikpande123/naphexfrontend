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
  
  // New states for empty slots feature
  const [showEmptySlots, setShowEmptySlots] = useState(false);
  const [emptySlots, setEmptySlots] = useState([]);
  const [emptySlotsSort, setEmptySlotsSort] = useState("level"); // "level" or "name"
  
  const treeWrapperRef = useRef(null);
  const nodeRefs = useRef({});

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        // Extract the userId from the userData
        const userId = userData.userids?.myuserid;
        
        if (!userId) {
          setError("User ID not found in localStorage");
          setLoading(false);
          return;
        }
        
        // Make API call with the userId
        const response = await axios.get(
          `${API_BASE_URL}/user-downline?userId=${userId}`
        );
        setTreeData(response.data);
        
        // Initialize default expanded nodes (first 2 levels)
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
        
        // Calculate maximum possible levels for dropdown
        const maxPossibleLevel = calculateMaxTreeDepth(response.data);
        if (maxPossibleLevel > 0) {
          const newLevelOptions = Array.from({ length: maxPossibleLevel }, (_, i) => i + 1);
          setLevelOptions(newLevelOptions);
        }

        // Calculate empty slots
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

  // Calculate the maximum depth of the tree
  const calculateMaxTreeDepth = (node, currentDepth = 1) => {
    if (!node || !node.children || node.children.length === 0) {
      return currentDepth;
    }
    
    return Math.max(
      ...node.children.map(child => calculateMaxTreeDepth(child, currentDepth + 1))
    );
  };

  // Calculate empty slots in the tree
  const calculateEmptySlots = (rootNode) => {
    const slots = [];
    
    const findEmptySlots = (node, level = 0) => {
      if (!node) return;
      
      // Check if this node has empty slots
      if (!node.children || node.children.length === 0) {
        // Both slots are empty
        slots.push({
          parentName: node.name,
          parentId: node.userId,
          level: level + 1,
          availablePositions: ["left", "right"]
        });
      } else if (node.children.length === 1) {
        // One slot is empty
        const existingChild = node.children[0];
        const existingPosition = existingChild.position || "left"; // Default to left if no position
        const emptyPosition = existingPosition === "left" ? "right" : "left";
        
        slots.push({
          parentName: node.name,
          parentId: node.userId,
          level: level + 1,
          availablePositions: [emptyPosition]
        });
      }
      
      // Recursively check children
      if (node.children) {
        node.children.forEach(child => findEmptySlots(child, level + 1));
      }
    };
    
    findEmptySlots(rootNode);
    setEmptySlots(slots);
  };

  // Sort empty slots based on selected criteria
  const getSortedEmptySlots = () => {
    const sorted = [...emptySlots];
    
    if (emptySlotsSort === "level") {
      sorted.sort((a, b) => a.level - b.level);
    } else if (emptySlotsSort === "name") {
      sorted.sort((a, b) => a.parentName.localeCompare(b.parentName));
    }
    
    return sorted;
  };

  // Navigate to user (similar to search functionality)
  const navigateToUser = (userId) => {
    // Find the user in the tree and create a path to it
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
      // Expand all nodes in the path
      setViewMode("custom");
      userPath.forEach(pathNode => {
        setExpandedNodes(prev => ({...prev, [pathNode.userId]: true}));
      });
      
      // Set search results to highlight the user
      setSearchResults([userPath]);
      setSearchPaths([userPath.map(node => node.userId)]);
      
      // Close the modal
      setShowEmptySlots(false);
      
      // Scroll to the user after a short delay
      setTimeout(() => {
        const nodeElement = nodeRefs.current[userId];
        if (nodeElement && treeWrapperRef.current) {
          const nodeRect = nodeElement.getBoundingClientRect();
          const wrapperRect = treeWrapperRef.current.getBoundingClientRect();
          
          treeWrapperRef.current.scrollLeft = 
            nodeElement.offsetLeft - (wrapperRect.width / 2) + (nodeRect.width / 2);
          treeWrapperRef.current.scrollTop = 
            nodeElement.offsetTop - (wrapperRect.height / 2) + (nodeRect.height / 2);
        }
      }, 100);
    }
  };

  // Expand/collapse based on current view mode and max level
  useEffect(() => {
    if (!treeData) return;
    
    let newExpandedNodes = {};
    
    const processNode = (node, level = 0) => {
      if (!node) return;
      
      if (viewMode === "full") {
        // Show all nodes in full view
        newExpandedNodes[node.userId] = true;
      } else if (viewMode === "default") {
        // Show only up to max level in default view
        newExpandedNodes[node.userId] = level < maxLevel;
      }
      
      if (node.children) {
        node.children.forEach(child => processNode(child, level + 1));
      }
    };
    
    processNode(treeData);
    
    // For custom view, keep existing expanded nodes
    if (viewMode === "custom") {
      newExpandedNodes = {...expandedNodes};
    }
    
    setExpandedNodes(newExpandedNodes);
  }, [viewMode, maxLevel, treeData]);

  // Scroll to highlighted node after search
  useEffect(() => {
    if (searchResults.length > 0) {
      // Get the first highlighted node's ID
      const firstResult = searchResults[0];
      const highlightedNodeId = firstResult[firstResult.length - 1].userId;
      
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        const nodeElement = nodeRefs.current[highlightedNodeId];
        if (nodeElement && treeWrapperRef.current) {
          // Calculate scroll position
          const nodeRect = nodeElement.getBoundingClientRect();
          const wrapperRect = treeWrapperRef.current.getBoundingClientRect();
          
          // Scroll the wrapper to center the highlighted node
          treeWrapperRef.current.scrollLeft = 
            nodeElement.offsetLeft - (wrapperRect.width / 2) + (nodeRect.width / 2);
          treeWrapperRef.current.scrollTop = 
            nodeElement.offsetTop - (wrapperRect.height / 2) + (nodeRect.height / 2);
        }
      }, 100);
    }
  }, [searchResults]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchPaths([]);
      return;
    }

    const results = [];
    const paths = [];
    const searchInTree = (node, path = []) => {
      if (!node) return;
      
      const currentPath = [...path, node];
      
      // Check if current node matches search
      if (
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        node.userId.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        results.push([...currentPath]);
        
        // Store all node IDs in the path for highlighting
        paths.push(currentPath.map(node => node.userId));
        
        // Expand all nodes in the path
        setViewMode("custom");
        currentPath.forEach(pathNode => {
          setExpandedNodes(prev => ({...prev, [pathNode.userId]: true}));
        });
      }
      
      // Search in children
      if (node.children) {
        node.children.forEach(child => searchInTree(child, currentPath));
      }
    };
    
    searchInTree(treeData);
    setSearchResults(results);
    setSearchPaths(paths);
  };

  // Toggle node expansion
  const toggleNode = (userId) => {
    setViewMode("custom");
    setExpandedNodes(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Show full tree
  const showFullTree = () => {
    setViewMode("full");
  };

  // Show tree up to certain level
  const showUpToLevel = (level) => {
    setMaxLevel(level);
    setViewMode("default");
  };

  // Collapse tree to level 1 (only root node visible)
  const collapseTree = () => {
    setMaxLevel(1);
    setViewMode("default");
  };

  // Show empty slots modal
  const showEmptySlotsModal = () => {
    setShowEmptySlots(true);
  };

  // Check if a node is in search results
  const isHighlighted = (node) => {
    return searchResults.some(path => 
      path.some(pathNode => pathNode.userId === node.userId)
    );
  };

  // Check if node is in a search path (for highlighting the path to the result)
  const isInSearchPath = (nodeId) => {
    return searchPaths.some(path => path.includes(nodeId));
  };

  // Format number with commas for better readability
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Generate empty placeholder node for missing children
  const renderEmptyNode = (position) => {
    const nodeClass = position === "left" ? "empty-node-placeholder left-side" : "empty-node-placeholder right-side";
    
    return (
      <div className={nodeClass}></div>
    );
  };

  const colors = {
    primary: '#1e88e5',   // Primary blue
    secondary: '#5e35b1', // Secondary purple
    accent: '#00acc1',    // Accent teal
    lightBg: '#e3f2fd',   // Light background
    text: '#263238',      // Dark text
    white: '#ffffff',     // White
    note: '#f9a825'       // Warning/note color
  };

  // Render tree nodes - MODIFIED to ensure balanced layout
  const renderTree = (node, level = 0, parentNode = null, position = null) => {
    if (!node) return null;
    
    const isExpanded = expandedNodes[node.userId];
    const isNodeHighlighted = isHighlighted(node);
    const isPathNode = isInSearchPath(node.userId);
    const hasChildren = node.children && node.children.length > 0;
    
    // Determine node class
    let nodeClass = "user-box";
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
            <span className="user-name">{node.name}</span>
            <span className="user-id">ID: {node.userId}</span>
            
            {/* Additional user details */}
            <div className="user-metrics">
              <div className="metric">
                <span className="metric-label">Played Yesterday:</span>
                <span className="metric-value">₹{formatNumber(node.totalPlayedAmount || 0)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Bonus After Tax(tdy):</span>
                <span className="metric-value">₹{formatNumber(node.bonusAfterTax || 0)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Total Bonus Received:</span>
                <span className="metric-value">₹{formatNumber(node.totalBonusReceivedTillDate || 0)}</span>
              </div>
            </div>
          </div>
          
          {hasChildren && (
            <button 
              className="toggle-button"
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
            <div className="children-container">
              {/* MODIFIED: Ensure left and right child positions are preserved */}
              {node.children.length === 2 ? (
                // Both children exist - normal rendering
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
                // Only one child exists - need to determine if it's left or right
                // and render placeholder for the missing position
                <>
                  {/* If first (and only) child has position info */}
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
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
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

          {/* New Empty Slots Button */}
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

      {/* Empty Slots Modal */}
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