import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaGamepad, FaCoins, FaCheckCircle, FaClock, FaTrophy,
    FaCheck, FaArrowLeft, FaQuestionCircle, FaChartBar, FaTrash, FaClipboard, FaCrown
} from "react-icons/fa";
import "./Game1.css";
import { useNavigate } from "react-router-dom";

// Manually import images
import picture1 from "../images/picture-1.png";
import picture2 from "../images/picture-2.png";
import picture3 from "../images/picture-3.png";
import picture4 from "../images/picture-4.png";
import picture5 from "../images/picture-5.png";
import picture6 from "../images/picture-6.png";
import picture7 from "../images/picture-7.png";
import picture8 from "../images/picture-8.png";
import picture9 from "../images/picture-9.png";
import picture0 from "../images/picture-0.png";
import API_BASE_URL from "./ApiConfig";

const imageToNumber = {
    [picture1]: 1, [picture2]: 2, [picture3]: 3,
    [picture4]: 4, [picture5]: 5, [picture6]: 6,
    [picture7]: 7, [picture8]: 8, [picture9]: 9,
    [picture0]: 0,
};

const images = [picture1, picture2, picture3, picture4, picture5,
    picture6, picture7, picture8, picture9, picture0];

const sessionTimings = [
    {
        label: "Session 1",
        start: "10:00 AM",
        end: "5:00 PM",
        breaks: [
            { time: "2:00 PM", disabledModes: ["3-fruits-start", "1-fruits-start", "2-fruits"] }
        ]
    },
    {
        label: "Session 2",
        start: "5:00 PM",
        end: "11:45 PM",
        breaks: [
            { time: "9:00 PM", disabledModes: ["3-fruits-start", "1-fruits-start", "2-fruits"] }
        ]
    }
];

const choiceModes = [
    "3-fruits-start",
    "1-fruits-start",
    "3-fruits-end",
    "1-fruits-end",
    "2-fruits"
];

// Mode display names mapping
const modeDisplayNames = {
    "3-fruits-start": "3 FRUITS START",
    "1-fruits-start": "1 FRUITS START", 
    "3-fruits-end": "3 FRUITS END",
    "1-fruits-end": "1 FRUITS END",
    "2-fruits": "2 FRUITS"
};

const OpenCloseGame = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [choiceMode, setChoiceMode] = useState("");
    const [betAmount, setBetAmount] = useState("");
    const [tokenCount, setTokenCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("info");
    const [sessionCountdowns, setSessionCountdowns] = useState({});
    const navigate = useNavigate();
    const bottomSectionRef = useRef(null);

    // Add this script to your component or as a separate file
    useEffect(() => {
        // Function to set image URLs as CSS variables
        const setupImageVariables = () => {
            const imageItems = document.querySelectorAll('.image-item-full');
            
            imageItems.forEach(item => {
                const img = item.querySelector('img');
                if (img && img.src) {
                    // Set the image URL as a CSS variable
                    item.style.setProperty('--image-url', `url(${img.src})`);
                }
            });
        };
        
        // Run the setup after the component mounts
        setupImageVariables();
        
        // Also run it whenever the image grid might change
        window.addEventListener('resize', setupImageVariables);
        
        return () => {
            window.removeEventListener('resize', setupImageVariables);
        };
    }, [images]); // Depend on the images array to re-run if it changes

    useEffect(() => {
        let eventSource = null;

        const connectToTokenUpdates = () => {
            try {
                const userData = JSON.parse(localStorage.getItem("userData"));
                if (!userData || !userData.phoneNo) return;

                // Create EventSource connection
                eventSource = new EventSource(
                    `${API_BASE_URL}/user-profile/${userData.phoneNo}`
                );

                // Handle incoming messages
                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.success) {
                            setTokenCount(data.tokens);

                            // Update localStorage with new data
                            const currentUserData = JSON.parse(localStorage.getItem("userData"));
                            localStorage.setItem("userData", JSON.stringify({
                                ...currentUserData,
                                tokens: data.tokens,
                            }));
                        }
                    } catch (e) {
                        // Silently handle JSON parsing errors
                    }
                };

                // Handle connection errors
                eventSource.onerror = () => {
                    eventSource.close();
                    // Attempt to reconnect after 5 seconds
                    setTimeout(connectToTokenUpdates, 5000);
                };
            } catch (error) {
                // Fallback to stored tokens
                const storedUserData = JSON.parse(localStorage.getItem("userData"));
                if (storedUserData && storedUserData.tokens) {
                    setTokenCount(storedUserData.tokens);
                }
            }
        };

        // Initial connection
        connectToTokenUpdates();

        // Cleanup on component unmount
        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, []);

    const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        return { hours, minutes };
    };

    const calculateCountdown = (session) => {
        const now = new Date();
        const { hours: endHours, minutes: endMinutes } = parseTime(session.end);
        const endTime = new Date(now);
        endTime.setHours(endHours, endMinutes, 0, 0);

        if (endTime <= now) {
            endTime.setDate(endTime.getDate() + 1);
        }

        const difference = endTime.getTime() - now.getTime();
        const remainingSeconds = Math.floor(difference / 1000);

        return {
            hours: Math.floor(remainingSeconds / 3600),
            minutes: Math.floor((remainingSeconds % 3600) / 60),
            seconds: remainingSeconds % 60,
        };
    };

    const getValidationRules = (mode) => {
        switch (mode) {
            case "3-fruits-start":
            case "3-fruits-end":
                return {
                    minSelections: 3,
                    maxSelections: 3,
                    orderType: "ascending"
                };
            case "1-fruits-start":
            case "1-fruits-end":
                return {
                    minSelections: 1,
                    maxSelections: 1
                };
            case "2-fruits":
                return {
                    minSelections: 2,
                    maxSelections: 2,
                    orderType: "any"
                };
            default:
                return {};
        }
    };

    const showPopup = (message, type = "info") => {
        setModalMessage(message);
        setModalType(type);
        setShowModal(true);
        setTimeout(() => setShowModal(false), 2000);
    };

    const isSessionSelectable = (session) => {
        const now = currentTime;
        const { hours: startHours, minutes: startMinutes } = parseTime(session.start);
        const { hours: endHours, minutes: endMinutes } = parseTime(session.end);

        const sessionStart = new Date(now);
        sessionStart.setHours(startHours, startMinutes, 0, 0);

        const sessionEnd = new Date(now);
        sessionEnd.setHours(endHours, endMinutes, 0, 0);

        if (endHours < startHours) {
            sessionEnd.setDate(sessionEnd.getDate() + 1);
        }

        return now <= sessionEnd;
    };

    const handleSessionSelect = (sessionIndex) => {
        const session = sessionTimings[sessionIndex];
        if (isSessionSelectable(session)) {
            setSelectedSession(sessionIndex);
            setChoiceMode("");
            setSelectedImages([]);
            setBetAmount("");
        } else {
            showPopup("This session has ended!", "warning");
        }
    };

    const isChoiceModeDisabledDuringBreak = (mode) => {
        if (!selectedSession && selectedSession !== 0) return false;

        const session = sessionTimings[selectedSession];
        const breakPoints = session.breaks || [];
        const currentTime = new Date();

        return breakPoints.some(bp => {
            const breakTime = parseTime(bp.time);
            const breakDateTime = new Date();
            breakDateTime.setHours(breakTime.hours, breakTime.minutes, 0, 0);

            // Check if current time is at or past break time
            return (
                (mode === "3-fruits-start" || mode === "1-fruits-start" || mode === "2-fruits") &&
                currentTime >= breakDateTime &&
                bp.disabledModes.includes(mode)
            );
        });
    };

    const handleChoiceMode = (mode) => {
        if (selectedSession === null) {
            showPopup("Select a session first!", "warning");
            return;
        }

        const session = sessionTimings[selectedSession];
        const currentTime = new Date();
        const breakPoints = session.breaks || [];

        // Check for mode restrictions during break points
        const activeBreakPoint = breakPoints.find(bp => {
            const breakTime = parseTime(bp.time);
            const breakDateTime = new Date();
            breakDateTime.setHours(breakTime.hours, breakTime.minutes, 0, 0);
            return currentTime >= breakDateTime;
        });

        // If there's an active break point and the mode is disabled
        if (activeBreakPoint && activeBreakPoint.disabledModes.includes(mode)) {
            showPopup(`${modeDisplayNames[mode]} is not available during break time!`, "warning");
            return;
        }

        setChoiceMode(mode);
        setSelectedImages([]);
        showPopup(`${modeDisplayNames[mode]} mode selected`, "info");
        bottomSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleImageSelect = (imagePath) => {
        if (!choiceMode) {
            showPopup("Select a game mode first!", "warning");
            return;
        }

        const validationRules = getValidationRules(choiceMode);
        const { minSelections, maxSelections, orderType } = validationRules;

        if (selectedImages.length >= maxSelections) {
            showPopup(`Maximum ${maxSelections} images for ${modeDisplayNames[choiceMode]} mode`, "warning");
            return;
        }

        // Normalize number for comparisons
        const normalizedNumber = imageToNumber[imagePath] === 0 ? 10 : imageToNumber[imagePath];
        const selectedNumbers = selectedImages.map(img =>
            imageToNumber[img] === 0 ? 10 : imageToNumber[img]
        );

        // Validation logic based on mode
        if (orderType === "ascending" &&
            selectedNumbers.length > 0 &&
            normalizedNumber < Math.max(...selectedNumbers)) {
            showPopup("Numbers must be selected in ascending order!", "warning");
            return;
        }

        setSelectedImages(prev => [...prev, imagePath]);
    };

    const handleRemoveSelectedImage = (img) => {
        setSelectedImages((prev) => prev.filter((image) => image !== img));
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const newTime = new Date();
            setCurrentTime(newTime);

            const newCountdowns = sessionTimings.reduce((acc, session, index) => {
                acc[index] = calculateCountdown(session);
                return acc;
            }, {});

            setSessionCountdowns(newCountdowns);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleBet = async () => {
        try {
            // Basic validation checks
            if (!selectedSession && selectedSession !== 0) {
                showPopup("Select a session first!", "warning");
                return;
            }
    
            if (!choiceMode) {
                showPopup("Select a game mode first!", "warning");
                return;
            }
    
            if (!betAmount) {
                showPopup("Enter bet amount!", "warning");
                return;
            }
    
            const betAmountNum = Number(betAmount);
    
            if (betAmountNum > tokenCount) {
                showPopup("Insufficient balance!", "error");
                return;
            }
    
            // Updated validation checks with new mode names
            if (choiceMode === "3-fruits-start" && selectedImages.length !== 3) {
                showPopup("3 Fruits Start requires exactly 3 numbers!", "warning");
                return;
            }
    
            if (choiceMode === "3-fruits-end" && selectedImages.length !== 3) {
                showPopup("3 Fruits End requires exactly 3 numbers!", "warning");
                return;
            }
    
            if (choiceMode === "2-fruits" && selectedImages.length !== 2) {
                showPopup("2 Fruits requires exactly 2 numbers!", "warning");
                return;
            }
    
            if ((choiceMode === "1-fruits-start" || choiceMode === "1-fruits-end") && selectedImages.length !== 1) {
                showPopup(`${choiceMode === "1-fruits-start" ? "1 Fruits Start" : "1 Fruits End"} requires exactly 1 number!`, "warning");
                return;
            }
    
            if (selectedImages.length === 0) {
                showPopup("Select images first!", "warning");
                return;
            }
    
            // Get userData from localStorage and ensure userids exist
            const userDataString = localStorage.getItem('userData');
            const userData = JSON.parse(userDataString);
            
            // Check if userids exists and has valid data - using lowercase 'userids'
            if (!userData.userids || !userData.userids.myuserid || !userData.userids.myrefrelid) {
                showPopup("User ID information is missing! Please login again.", "error");
                return;
            }
    
            const userPhoneNo = userData.phoneNo;
            const userId = userData.userids.myuserid;  // Changed to lowercase 'userids'
            const refRelId = userData.userids.myrefrelid;  // Changed to lowercase 'userids'
    
            if (!userId || !refRelId) {
                showPopup("User ID or Referral ID not found! Please login again.", "error");
                return;
            }
    
            // Update played amount before proceeding with bet
            try {
                const updatePlayedAmountResponse = await fetch(`${API_BASE_URL}/updatePlayedAmount`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        amount: betAmountNum
                    })
                });
    
                if (!updatePlayedAmountResponse.ok) {
                    throw new Error(`Failed to update played amount: ${updatePlayedAmountResponse.statusText}`);
                }
            } catch (error) {
                console.error("Error updating played amount:", error);
                // Continue with bet placement even if played amount update fails
            }
    
            // Token deduction
            const deductResponse = await fetch(`${API_BASE_URL}/deduct-tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    phoneNo: userPhoneNo,
                    amount: betAmountNum,
                    userId: userId,
                    refRelId: refRelId
                })
            });
    
            if (!deductResponse.ok) {
                throw new Error(`HTTP error! status: ${deductResponse.status}`);
            }
    
            const deductResult = await deductResponse.json();
    
            if (!deductResult.success) {
                showPopup(deductResult.message || "Failed to place bet. Please try again.", "error");
                return;
            }
    
            // Map selected images to corresponding numbers
            const selectedNumbers = selectedImages.map((img) => imageToNumber[img]);
    
            // Store game action with userId and refRelId
            const gameActionResponse = await fetch(`${API_BASE_URL}/store-game-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    phoneNo: userPhoneNo,
                    sessionNumber: selectedSession + 1,
                    gameMode: choiceMode,
                    betAmount: betAmountNum,
                    selectedNumbers: selectedNumbers,
                    userId: userId,
                    refRelId: refRelId
                })
            });
    
            if (!gameActionResponse.ok) {
                throw new Error(`HTTP error! status: ${gameActionResponse.status}`);
            }
    
            const gameActionResult = await gameActionResponse.json();
    
            if (!gameActionResult.success) {
                showPopup(gameActionResult.message || "Failed to store game action. Please try again.", "error");
                return;
            }
    
            // Store bet numbers with userId
            const storeBetResponse = await fetch(`${API_BASE_URL}/store-bet-numbers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    sessionNumber: selectedSession + 1,
                    choiceMode: choiceMode,
                    selectedNumbers: selectedNumbers,
                    betAmount: betAmountNum,
                    userId: userId
                })
            });
    
            if (!storeBetResponse.ok) {
                throw new Error(`HTTP error! status: ${storeBetResponse.status}`);
            }
    
            const storeBetResult = await storeBetResponse.json();
    
            if (!storeBetResult.success) {
                console.error('Failed to store bet numbers:', storeBetResult.message);
            }
    
            // Show success message and update UI
            showPopup("Bet Placed Successfully!", "success");
    
            // Reset all selections and inputs
            setSelectedImages([]);
            setChoiceMode("");
            setBetAmount("");
            setSelectedSession(null);
    
            // Update the displayed token count
            if (typeof setTokenCount === 'function') {
                setTokenCount(deductResult.currentBalance);
            }
    
            // Update userData in localStorage while preserving existing userids
            userData.tokens = deductResult.currentBalance;
            // Ensure we keep the existing userids structure with lowercase
            userData.userids = {
                myuserid: userId,
                myrefrelid: refRelId
            };
            localStorage.setItem('userData', JSON.stringify(userData));
    
        } catch (error) {
            console.error("Error placing bet:", error);
            showPopup("Failed to place bet. Please try again.", "error");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="game-container-full"
        >
            <div className="game-header">
                <button
                    className="nav-button back-button"
                    onClick={() => navigate("/home")}
                >
                    <FaArrowLeft className="ic"/>
                    <span>Back</span>
                </button>
                <h1 className="game-title">FRUITS-GAME</h1>
                <button className="nav-button how-to-play-button"
                onClick={() => navigate("/howtoplay")}
                >
                    <FaQuestionCircle className="ic"/>
                    <span>How to Play</span>
                </button>
                <button className="nav-button results-button"
                 onClick={() => navigate("/opencloseresult")}>
                    <FaCrown className="ic"/>
                    <span>Results</span>
                </button>
                <div className="top-bar">
                    <div className="current-time">
                        <FaClock /> {currentTime.toLocaleTimeString()}
                    </div>
                    <div className="user-balance">
                        <FaCoins /> {tokenCount.toFixed(2)} Tokens
                    </div>
                </div>
            </div>

            <div className="sessions-container">
                {sessionTimings.map((session, index) => (
                    <motion.div
                        key={index}
                        className={`session-box 
              ${selectedSession === index ? "selected-session" : ""} 
              ${isSessionSelectable(session) ? "" : "inactive-session"}`}
                        onClick={() => handleSessionSelect(index)}
                    >
                        <span>{session.label}</span>
                        <span>
                            {session.start} - {session.end}
                        </span>
                        {sessionCountdowns[index] && (
                            <div className="countdown-timer">
                                Remaining time: {String(sessionCountdowns[index].hours).padStart(2, "0")}:
                                {String(sessionCountdowns[index].minutes).padStart(2, "0")}:
                                {String(sessionCountdowns[index].seconds).padStart(2, "0")}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="choice-mode-buttons">
                {choiceModes.map((mode) => {
                    const isDisabledDuringBreak = isChoiceModeDisabledDuringBreak(mode);

                    return (
                        <motion.button
                            key={mode}
                            whileHover={{ scale: isDisabledDuringBreak ? 1 : 1.05 }}
                            whileTap={{ scale: isDisabledDuringBreak ? 1 : 0.95 }}
                            onClick={() => handleChoiceMode(mode)}
                            className={`choice-button 
                            ${choiceMode === mode ? "active" : ""} 
                            ${isDisabledDuringBreak ? "faded-during-break disabled " : ""}`}
                            style={{
                                opacity: isDisabledDuringBreak ? 0.3 : 1,
                                pointerEvents: isDisabledDuringBreak ? "none" : "auto"
                            }}
                            disabled={isDisabledDuringBreak}
                        >
                            {modeDisplayNames[mode]}
                            {isDisabledDuringBreak && <span className="break-indicator"></span>}
                        </motion.button>
                    );
                })}
            </div>

            {/* Image Selection Component (Previous implementation) */}
            <div className="image-grid-full">
                {images.map((img, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.18 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleImageSelect(img)}
                        className="image-item-full"
                    >
                        <img src={img} alt={`Picture ${imageToNumber[img]}`} />
                    </motion.div>
                ))}
            </div>

            {selectedImages.length > 0 && (
                <div className="selected-images-dropdown">
                    <h3>Selected Pictures</h3>
                    <div className="selected-images-container">
                        {selectedImages.map((img, index) => (
                            <div key={index} className="selected-image-item">
                                <img src={img} alt={`Selected ${imageToNumber[img]}`} />
                                <button
                                    className="remove-selected-button"
                                    onClick={() => handleRemoveSelectedImage(img)}
                                >
                                    <FaTrash /> Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bet-section" ref={bottomSectionRef}>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="bet-input"
                    placeholder="Enter Bet Amount"
                    value={betAmount}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setBetAmount(value);
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bet-button"
                    onClick={handleBet}
                >
                    Place Bet
                </motion.button>
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-full"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            className={`modal-content-full ${modalType}`}
                        >
                            <div className="modal-message">{modalMessage}</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OpenCloseGame;