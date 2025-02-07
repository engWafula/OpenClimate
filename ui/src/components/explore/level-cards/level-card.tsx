import { FunctionComponent, useEffect, useRef, useState } from "react";
import { Card, Collapse } from "@mui/material";
import "./level-cards.page.scss";
import { DropdownOption } from "../../../shared/interfaces/dropdown/dropdown-option";
import {
  Search,
  ArrowDropDown,
  ArrowDropUp,
  HighlightOff,
  SwapVert,
} from "@mui/icons-material";
import { FilterTypes } from "../../../api/models/review/dashboard/filterTypes";
import { renderHighlightedName } from "../../util/strings";
import { renderDataMissingDropdown } from "../../util/showDataMissingDropdown";
import { MdArrowBack, MdSearch } from "react-icons/md";

interface IProps {
  label: string;
  onSelect?: (option: DropdownOption) => void;
  onDeSelect?: () => void;
  disabled: boolean;
  selectedValue: string;
  options: Array<DropdownOption>;
  onButtonSwap?: () => void;
  isCity?: boolean;
  placeholder?: string;
  buttonDisabled?: boolean;
}

const LevelCard: FunctionComponent<IProps> = (props) => {
  const {
    label,
    onSelect,
    onDeSelect,
    disabled,
    selectedValue,
    options,
    onButtonSwap,
    isCity,
    placeholder,
    buttonDisabled,
  } = props;
  const [cardExpanded, setCardExpanded] = useState(false);
  const [inputString, setInputString] = useState<string>("");
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number>(-1);
  const inputComponentRef = useRef<any>(null);

  const handleClickOutside = (event: MouseEvent) => {
    inputComponentRef.current &&
      !inputComponentRef.current.contains(event.target) &&
      setCardExpanded(false);
  };

  const onOptionClick = (option: DropdownOption) => {
    setCardExpanded(false);
    onSelect?.(option);
    setInputString("");
  };

  const exitPopup = () => {
    setCardExpanded(false);
  }

  useEffect(() => {
    if(window.screen.width <= 480){
      document.removeEventListener("click", handleClickOutside, true);
    }else {
      document.addEventListener("click", handleClickOutside, true);
    }
    
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [window.screen.width]);

  return (
    <div className="level-card">
      <div className="label">{label}</div>
      <Card className="outer-card">
        <Card className={disabled ? "inner-card-disabled" : "inner-card"}>
          <div className="content">
            <div
              className="dropdown"
              onClick={() =>
                !disabled && !selectedValue && setCardExpanded(true)
              }
            >
              <Search />
              {selectedValue ? (
                <>
                  <div className="dropdown-text-selected">{selectedValue}</div>
                  {cardExpanded ? (
                    <ArrowDropUp
                      className={disabled ? "icon-disabled" : "drop-icon"}
                    />
                  ) : (
                    <ArrowDropDown
                      className={disabled ? "icon-disabled" : "drop-icon"}
                    />
                  )}
                  <div className="dropdown-cross-icon">
                    <HighlightOff
                      className="dropdown-cross-icon"
                      onClick={onDeSelect}
                    />
                  </div>
                </>
              ) : (
                <>
                  <input
                    className="dropdown-text"
                    ref={inputComponentRef}
                    placeholder={placeholder || "Add level"}
                    type="text"
                    onChange={(event) => setInputString(event.target.value)}
                    disabled={disabled}
                  />
                  {cardExpanded ? (
                    <ArrowDropUp
                      className={disabled ? "icon-disabled" : "drop-icon"}
                    />
                  ) : (
                    <ArrowDropDown
                      className={disabled ? "icon-disabled" : "drop-icon"}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </Card>
        <div className="menu-dropdown">
          <Collapse in={cardExpanded} timeout="auto" unmountOnExit>
            <div className="dropdown-container" id={"dropdown"}>
              {options
                .filter((option) =>
                  option.name.toLowerCase().includes(inputString.toLowerCase())
                )
                .map((option, index) => (
                  <div
                    className="dropdown-select"
                    key={`dropdown-item-${index}`}
                    onClick={() => onOptionClick(option)}
                    onMouseEnter={() => setHoveredOptionIndex(index)}
                    onMouseLeave={() => setHoveredOptionIndex(-1)}
                  >
                    <div className="dropdown-select-text">
                      {inputString
                        ? renderHighlightedName(option.name, inputString)
                        : option.name}
                    </div>
                    <div className="dropdown-select-missing-container">
                      {renderDataMissingDropdown(
                        hoveredOptionIndex === index,
                        option?.data === true
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Collapse>
        </div>
      
      </Card>
      {
        cardExpanded && (
          <div  className="menu-form-popup">
            <div className="menu-form-head">
              <button onClick={exitPopup}>
                <MdArrowBack className="menu-form-icon"/>
              </button>
            </div>
            <div className="container">
                <div className="inputBox">
                    <p className="actorType">{label}</p>
                    <div className="searchInput">
                        <div className="dropdownWrapper">
                            <MdSearch className="icon"/>
                            <input  
                              className="input" ref={inputComponentRef}
                              placeholder={placeholder || "Add level"}
                              type="text"
                              onChange={(event) => setInputString(event.target.value)}/>
                        </div>
                    </div>
                </div>
                <div className="searchResultsContent">
                    <div className="recentRes">
                      {options.length ? options
                        .filter((option) =>
                          option.name.toLowerCase().includes(inputString.toLowerCase())
                        )
                        .map((option, index) => (
                          <div
                            className="dropdown-select"
                            key={`dropdown-item-${index}`}
                            onClick={() => onOptionClick(option)}
                            onMouseEnter={() => setHoveredOptionIndex(index)}
                            onMouseLeave={() => setHoveredOptionIndex(-1)}
                          >
                            <div className="dropdown-select-text">
                              {inputString
                                ? renderHighlightedName(option.name, inputString)
                                : option.name} <br/>
                                
                            </div>
                            <div className="dropdown-select-missing-container">
                              {renderDataMissingDropdown(
                                hoveredOptionIndex === index,
                                option?.data === true
                              )}
                            </div>
                          </div>
                        )) : (
                          <p>RECENT RESULTS</p>
                        )}
                    </div>
                </div>
            </div>
          </div>
        )
      }
      {onButtonSwap && isCity !== undefined && (
        <button
          className={
            buttonDisabled ? "swapto-button-disabled" : "swapto-button"
          }
          style={
            isCity
              ? { width: "161px", marginLeft: "165px" }
              : { width: "124px", marginLeft: "200px" }
          }
          onClick={() => !buttonDisabled && onButtonSwap()}
        >
          <SwapVert sx={{ fontSize: "18px" }} />
          <div className="button-text">
            {isCity ? "Swap to company" : "Swap to city"}
          </div>
        </button>
      )}
    </div>
  );
};

export default LevelCard;
