import React, { useState, useEffect, useRef } from "react";
import "./AdminBinaryTree.css";
import axios from "axios";
import API_BASE_URL from "./ApiConfig";

const AdminBinaryTree = () => {
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

  // Add refs for scrolling to highlighted nodes
  const treeWrapperRef = useRef(null);
  const nodeRefs = useRef({});

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        // Call the new API endpoint without admin key parameter
        const response = await axios.get(
          `${API_BASE_URL}/admin-binary-tree`
        );

        // Process the flat data into a hierarchical tree structure
        const processedTreeData = processTreeData(response.data);
        setTreeData(processedTreeData);

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
        initExpandedNodes(processedTreeData);
        setExpandedNodes(defaultExpanded);

        // Calculate maximum possible levels for dropdown
        const maxPossibleLevel = calculateMaxTreeDepth(processedTreeData);
        if (maxPossibleLevel > 0) {
          const newLevelOptions = Array.from({ length: maxPossibleLevel }, (_, i) => i + 1);
          setLevelOptions(newLevelOptions);
        }
      } catch (err) {
        console.error("Error fetching tree data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, []);

  // Process flat data into hierarchical tree structure
  const processTreeData = (flatData) => {
    // Convert flat data to a map for easy access
    const nodesMap = {};

    // First pass: Create node objects
    Object.entries(flatData).forEach(([userId, userData]) => {
      nodesMap[userId] = {
        userId,
        name: userData.name,
        // Map API data fields to the component's expected fields
        totalPlayedAmount: userData.totalPlayed,
        todayPlayedAmount: userData.playedToday,
        totalLeftBusiness: userData.totalLeftBusiness,
        totalRightBusiness: userData.totalRightBusiness,
        bonusReceived: userData.totalBonusReceivedTillDate,
        totalBonusReceivedAfterTax: userData.totalBonusReceivedAfterTax,
        yesterdayBonusAfterTax: userData.yesterdayBonusAfterTax,
        children: []
      };
    });

    // Second pass: Build parent-child relationships
    Object.entries(flatData).forEach(([userId, userData]) => {
      if (userData.leftChild) {
        nodesMap[userId].children.push(nodesMap[userData.leftChild]);
      }

      if (userData.rightChild) {
        nodesMap[userId].children.push(nodesMap[userData.rightChild]);
      }
    });

    // Find the root node (node with no referralId)
    const rootNode = Object.values(flatData).find(node => node.referralId === null);
    if (!rootNode) {
      // If no clear root, just take the first node
      return Object.values(nodesMap)[0];
    }

    return nodesMap[Object.keys(flatData).find(key => flatData[key].referralId === null)];
  };

  // Calculate the maximum depth of the tree
  const calculateMaxTreeDepth = (node, currentDepth = 1) => {
    if (!node || !node.children || node.children.length === 0) {
      return currentDepth;
    }

    return Math.max(
      ...node.children.map(child => calculateMaxTreeDepth(child, currentDepth + 1))
    );
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
      newExpandedNodes = { ...expandedNodes };
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
        node.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        results.push([...currentPath]);

        // Store all node IDs in the path for highlighting
        paths.push(currentPath.map(node => node.userId));

        // Expand all nodes in the path
        setViewMode("custom");
        currentPath.forEach(pathNode => {
          setExpandedNodes(prev => ({ ...prev, [pathNode.userId]: true }));
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

  // Handle navigation to binary table
  const handleShowBinaryTable = () => {
    // You can replace this with your actual navigation logic
    // For example, if you're using React Router:
    // navigate('/binarytable');
    
    // Or if you're using window.location:
    window.location.href = '/binarytable';
    
    // Or if you have a custom navigation function, call it here
    // props.onNavigate('/binarytable');
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

  // Render tree nodes with empty placeholders for balance
  const renderTree = (node, level = 0, parentNode = null, position = null) => {
    if (!node && level === 0) return null; // Don't render anything if root is null
    
    // For empty nodes (placeholders), create a basic structure
    if (!node) {
      return (
        <div className="tree-node empty-node" data-level={level}>
          <div className={`user-box empty-box ${position === "left" ? "left-node" : "right-node"}`}>
            <span className="user-name">Empty</span>
            <div className="admin-financial-data">
              <div className="financial-item">
                <span className="financial-label">No Data</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const isExpanded = expandedNodes[node.userId];
    const isNodeHighlighted = isHighlighted(node);
    const isPathNode = isInSearchPath(node.userId);
    const hasChildren = node.children && node.children.length > 0;
    
    // Calculate if we need placeholders
    let leftChild = null;
    let rightChild = null;
    
    if (node.children && node.children.length > 0) {
      leftChild = node.children[0];
      rightChild = node.children.length > 1 ? node.children[1] : null;
    }

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
          <span className="user-name">{node.name}</span>
          <span className="user-id">ID: {node.userId}</span>

          {/* Admin-specific financial data */}
          <div className="admin-financial-data">
            <div className="financial-item">
              <span className="financial-label">Played:</span>
              <span className="financial-value">₹{node.totalPlayedAmount || 0}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Today:</span>
              <span className="financial-value">₹{node.todayPlayedAmount || 0}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Left Business:</span>
              <span className="financial-value">₹{node.totalLeftBusiness || 0}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Right Business:</span>
              <span className="financial-value">₹{node.totalRightBusiness || 0}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Bonus:</span>
              <span className="financial-value">₹{node.bonusReceived || 0}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Y.Bonus@Tax:</span>
              <span className="financial-value">₹{node.yesterdayBonusAfterTax || 0}</span>
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

        {isExpanded && (
          <div className="node-children">
            <div className="children-container">
              {/* Always render both left and right positions, even if children don't exist */}
              <div className="child-wrapper left-wrapper">
                {renderTree(leftChild, level + 1, node, "left")}
              </div>
              <div className="child-wrapper right-wrapper">
                {renderTree(rightChild, level + 1, node, "right")}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading network structure data...</p>
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
    <div className="binary-tree-container admin-tree">
      <h2 className="network-title">Admin Network Structure</h2>

      <div className="controls-container">
        <div className="search-control">
          <button
            className="binary-table-button"
            onClick={handleShowBinaryTable}
            title="Show Binary Users Table"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            Show Binary Users Table
          </button>
          
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
    </div>
  );
};

export default AdminBinaryTree;