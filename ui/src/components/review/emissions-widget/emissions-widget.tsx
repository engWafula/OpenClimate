import React, { FunctionComponent, useEffect, useState } from "react";
import "./emissions-widget.scss";
import {
  MdInfoOutline,
  MdArrowDropDown,
  MdArrowDropUp,
  MdOutlinePeopleAlt,
} from "react-icons/md";
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  Button,
  IconButton,
} from "@mui/material";

import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import Diversity3Icon from "@mui/icons-material/Diversity3";

import {
  ArrowForwardIos,
  ArrowRightAlt,
  InfoOutlined,
  MoreVert,
  OpenInNew
} from "@mui/icons-material";

import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@mui/material/Tooltip";
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import { MobileModalDropdown } from "../../../shared/components/modals/mobile/mobile-modal-dropdown";
import { useHistory } from "react-router-dom";
import { ServerUrls } from "../../../shared/environments/server.environments";

interface Props {
  current: any;
  parent: any;
  isMobile?: boolean;
  hasFilter?: boolean;
  hasDownload?: boolean;
  titleText?: string;
  subtitleText?: string;
}

export interface State extends SnackbarOrigin {
  open: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const EmissionsWidget: FunctionComponent<Props> = (props) => {
  const {
    current,
    isMobile,
    hasFilter,
    hasDownload,
    titleText,
    subtitleText
  } = props;
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const [mobileDownloadModal, toggleMobileDownloadModal] = useState<boolean>(false);
  const [mobileFilterModal, toggleMobileFilterModal] = useState<boolean>(false);

  const [tempYear, setTempYear] = useState<string>('');
  const [tempSource, setTempSource] = useState<string>('');
  
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('');
  const [notificationBackgroundColor, setnotificationBackgroundColor] = useState('');
  const [downloadError, setDownloadError] = useState(false);
  const [downloadFileType, setDownloadFileType] = useState('');

  const history = useHistory();

  const toggleScroll = () => {
     if (document.body.style.overflow !== "hidden") {
      document.body.style.overflow = "hidden";
     }
     else {
      document.body.style.overflow = "initial";
     }
  }

  const sourcesToNameValue = (sources: Array<string>) => {

    const sourceNameValue: Record<string, string> = {}
  
    sources.map(source => {
      sourceNameValue[current.emissions[source].publisher] = source;
    })

    return sourceNameValue;
  }

  const setMenuState = (event: any) => {
    event.preventDefault();
    setToggleMenu((e) => !e);
  };

  const useStyles = makeStyles(() => ({
    customTooltip: {
      backgroundColor: "rgba(44, 44, 44, 1)",
      padding: "10px",
    },
    customArrow: {
      color: "rgba(44, 44, 44, 1)",
    },
  }));

  const classes = useStyles();

  const sources =
    current && current.emissions ? Object.keys(current.emissions) : [];

  const sourceToName = sources && sourcesToNameValue(sources);

  sources.sort();

  // get current actor id
  const { actor_id } = current;

  const defaultSource = sources.length > 0 ? sources[0] : null;
  const defaultYear =
    defaultSource && current.emissions[defaultSource].data.length > 0
      ? current.emissions[defaultSource].data[0].year
      : null;
  const latestYear = defaultYear;

  const [currentSource, setCurrentSource] = useState<any>(defaultSource);
  const [currentYear, setCurrentYear] = useState<any>(defaultYear);

  const years = currentSource
    ? current.emissions[currentSource].data.map((e: any) => e.year)
    : [];
  const currentEmissions =
    currentSource && currentYear
      ? current.emissions[currentSource].data.find(
          (e: any) => e.year == currentYear
        )
      : null;
  const lastEmissions =
    currentSource && currentYear
      ? current.emissions[currentSource].data.find(
          (e: any) => e.year == currentYear - 1
        )
      : null;
  const trend =
    currentEmissions && lastEmissions
      ? (currentEmissions.total_emissions - lastEmissions.total_emissions) /
        lastEmissions.total_emissions
      : 0;
  const population =
    currentYear && current.population.length
      ? current.population
          .slice()
          .sort((p: any) => Math.abs(p.year - currentYear))
          .find((p: any) => Math.abs(p.year - currentYear) <= 5)
      : null;
  const perCapita =
    currentEmissions && population
      ? currentEmissions.total_emissions / population.population
      : null;
  const tags = currentSource
    ? currentEmissions
      ? current.emissions[currentSource].tags.concat(currentEmissions.tags)
      : current.emissions[currentSource].tags
    : [];

  const yearChangeHandler = (e: SelectChangeEvent<number>) => {
    const value = e.target.value as number;
    setCurrentYear(value);
  };

  const yearOnClick = (year: string) => setCurrentYear(parseInt(year));

  const sourceToClosestYear = (source: any) =>
    current.emissions[source].data
      .slice() // make a copy
      .sort(
        (
          a: any,
          b: any // sort by distance from current year
        ) => Math.abs(a.year - currentYear) - Math.abs(b.year - currentYear)
      )
      .shift().year; // pop off the first // and get its year

  const sourceChangeHandler = (e: SelectChangeEvent<number>) => {
    const source = e.target.value as number;
    // Find the year closest to the current year
    const closest = sourceToClosestYear(source);
    setCurrentSource(source);
    setCurrentYear(closest);
  };

  const sourceOnClick = (source: string) => {
    const sourceKey = sourceToName[source];
    const closest = sourceToClosestYear(sourceKey);
    setCurrentSource(sourceKey);
    setCurrentYear(closest);
  }

  const onApply = () => {
    tempSource && sourceOnClick(tempSource);
    tempYear && yearOnClick(tempYear);
    toggleModalMode('filter');
  }

  const onReset = () => {
    defaultSource && sourceOnClick(defaultSource);
    defaultYear && yearOnClick(defaultYear);
    toggleModalMode('filter');
  }

  const toggleModalMode = (type: string) => {
    type === "download" ? toggleMobileDownloadModal(!mobileDownloadModal) : toggleMobileFilterModal(!mobileFilterModal);
    toggleScroll();
  }


  const onDownloadOptionClick = (option: string) => {
    switch(option) {
      case "Download as CSV":
        return `/api/v1/download/${actor_id}-emissions.csv`;
      case "Download as JSON":
        return `/api/v1/download/${actor_id}-emissions.json`;
      default:
        return '';
    }
  }

  // handle download notification
  
  const handleDownload = (actorID: string, fileType: string) => {
      setToggleMenu(false);
      setOpen(true);
      setSeverity("info");
      setMessage('Preparing your dataset');
      setnotificationBackgroundColor('#001EA7');
      setDownloadError(false);
    fetch(`${ServerUrls.api}/v1/download/${actorID}-emissions.${fileType}`)
      .then(res=> {
        return res.blob();
      })
      .then(blob=>{
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${actorID}-emissions.${fileType}`;

        downloadLink.click();

        setOpen(true);
        setSeverity("success");
        setMessage('Dataset download complete');
        setnotificationBackgroundColor('#008600');
        setDownloadFileType(fileType);
        setDownloadError(false)
      })
      .catch(error=> {
        setOpen(true);
        setSeverity("error");
        setMessage('Download failed');
        setnotificationBackgroundColor('#F23D33');
        setDownloadFileType(fileType);
        setDownloadError(true);
      })
  }

  return (
    <>
      {
        mobileDownloadModal &&
        <MobileModalDropdown 
          headerText="Download"
          options={["Download as CSV", "Download as JSON"]}
          selectIcon={<DownloadIcon fontSize="inherit"/>}
          getOptionHref={onDownloadOptionClick}
          onClose={() => toggleModalMode("download")}
          modalType="download" />
      }
      {
        mobileFilterModal &&
        <MobileModalDropdown 
          headerText="Filter by"
          currentSource={tempSource || current.emissions[currentSource].publisher}
          sources={Object.keys(sourceToName)}
          sourceOnClick={(source: string) => setTempSource(source)}
          currentYear={tempYear || currentYear}
          yearOnClick={(year: string) => setTempYear(year)}
          onApply={onApply}
          onReset={onReset}
          years={years.map(year => `${year}`)}
          onClose={() => toggleModalMode("filter")}
          modalType="filter" />
      }
      <div
        className={isMobile ? "emissions-widget-mobile" : "emissions-widget"}
        style={{ height: currentEmissions ? "" : "268px" }}
        data-testid="emissions-widget"
      >
        {currentEmissions ? (
          <div className={isMobile ? "emissions-widget-mobile__wrapper" : "emissions-widget__wrapper"}>
            <div className="emissions-widget__metadata">
              <div>
                <div className="emissions-widget__metadata-inner">
                  <span data-testid="title" className={isMobile ? "emissions-widget-mobile__title" : "emissions-widget__title"}>{ titleText || 'Total emissions'}</span>
                  { !isMobile && <span>
                    <Tooltip
                      classes={{
                        tooltip: classes.customTooltip,
                        arrow: classes.customArrow,
                      }}
                      title={
                        <div className="tooltip">
                          GHG emissions emitted by the selected actor during the
                          selected year, according to the selected source
                        </div>
                      }
                      arrow
                      placement="right"
                    >
                      <InfoOutlined className="emissions-widget__icon info-icon" />
                    </Tooltip>
                  </span>
                  }
                </div>
                {latestYear != 0 && (
                  <span className={isMobile ? "emissions-widget-mobile__last-updated" : "emissions-widget__last-updated"}>{subtitleText || `Last updated in ${latestYear}`}</span>
                )}
              </div>
              <div className="emissions-widget__metadata-right">
                { isMobile && hasFilter &&
                    <div className="emissions-widget-mobile__filter-icon" onClick={() => toggleModalMode("filter")}>
                      <FilterListIcon/>
                    </div>
                }

                { isMobile && hasDownload &&
                    <div className="emissions-widget-mobile__download-icon" onClick={() => toggleModalMode("download")}>
                      <DownloadIcon />
                    </div>
                }

                { !isMobile &&
                <>
                  <div className="emissions-widget__metadata-right-inner">
                    <div className="emissions-widget__source-label">Source</div>
                    <div className="emissions-widget__source-title">
                      <FormControl
                        variant="standard"
                        sx={{
                          m: 1,
                          minWidth: 120,
                          margin: "0px",
                          minHeight: 30,
                          fontWeight: "700px",
                        }}
                      >
                        <Select
                          value={currentSource}
                          onChange={sourceChangeHandler}
                          id="demo-simple-select-standard"
                          role="data-source-select"
                          sx={{
                            border: "0px",
                            fontFamily: "Poppins",
                            fontSize: "10px",
                            position: "relative",
                          }}
                        >
                          {sources.map((source: any, index: number) => (
                            <MenuItem
                              sx={{
                                fontFamily: "Poppins",
                                fontSize: "10px",
                                position: "relative",
                                margin: "0px",
                                fontWeight: "700px",
                              }}
                              key={`emissions-datasource-option-${current.actor_id}-${source}`}
                              value={source}
                            >
                              {current.emissions[source].publisher}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                  <div className="emissions-widget__metadata-right-inner">
                    <div className="emissions-widget__source-label">Year</div>
                    <div className="emissions-widget__source-title">
                      <FormControl
                        variant="standard"
                        sx={{
                          m: 1,
                          minWidth: 120,
                          margin: "0px",
                          minHeight: 30,
                          fontWeight: "700px",
                        }}
                      >
                        <Select
                          value={currentYear}
                          role="year-select"
                          onChange={yearChangeHandler}
                          id="demo-simple-select-standard"
                          sx={{
                            border: "0px",
                            fontFamily: "Poppins",
                            fontSize: "10px",
                            position: "relative",
                          }}
                        >
                          {years?.map((year: any, index: number) => (
                            <MenuItem
                              sx={{
                                fontFamily: "Poppins",
                                fontSize: "10px",
                                position: "relative",
                                margin: "0px",
                                fontWeight: "700px",
                              }}
                              key={`emissions-year-option-${current.actor_id}-${currentSource}-${year}`}
                              value={parseInt(year)}
                            >
                              {year}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                  <div className="emissions-widget__metadata-right-inner">
                    <div className="emissions-widget__button-wrapper">
                      <Tooltip
                        classes={{
                          tooltip: classes.customTooltip,
                          arrow: classes.customArrow,
                        }}
                        title={
                          <div className="tooltip">Download or Export Data</div>
                        }
                        sx={{
                          display: toggleMenu ? "hidden" : "inline",
                        }}
                        arrow
                        placement="right"
                      >
                        <IconButton
                          onClick={setMenuState}
                          className="download_data-button"
                          role="icon-button"
                        >
                          <MoreVert className="download_data-icon" />
                        </IconButton>
                      </Tooltip>
                      {toggleMenu && (
                        <>
                          <div data-testid="download-menu" className="download_data-menu">
                            <ul className="menu-item">
                              <button
                                className="download-link"
                                onClick={()=>handleDownload(actor_id, 'csv')}
                              >
                                Download as CSV
                              </button>
                              <button
                                className="download-link"
                                onClick={()=>handleDownload(actor_id, 'json')}
                              >
                                Download as JSON
                              </button>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  </>
              }
              </div>
            </div>
            <div className={isMobile ? "emissions-widget-mobile__data" : "emissions-widget__data"}>
              <div className="emissions-widget__emissions-data">
                <div className="emissions-widget__col-1">
                  <div>
                    <span data-testid="emissions-value" className={isMobile ? "emissions-widget-mobile__total-emissions" : "emissions-widget__total-emissions"}>
                      {(currentEmissions.total_emissions / 1000000.0).toPrecision(
                        5
                      )}{" "}
                    </span>
                  </div>
                  {trend != 0 && (
                    <div className="emissions-widget__emissions-trend">
                      {trend > 0 ? (
                        <MdArrowDropUp className="emissions-widget__emissions-trend-icon-up" />
                      ) : (
                        <MdArrowDropDown className={isMobile ? "emissions-widget-mobile__emissions-trend-icon-down" : "emissions-widget__emissions-trend-icon-down"} />
                      )}
                      <span
                        className={
                          trend > 0
                            ? "emissions-widget__emissions-trend-value-red"
                            : "emissions-widget__emissions-trend-value-green"
                        }
                      >{`${trend > 0 ? "+" : ""}${(trend * 100.0).toPrecision(
                        3
                      )}%`}</span>
                      <Tooltip
                        classes={{
                          tooltip: classes.customTooltip,
                          arrow: classes.customArrow,
                        }}
                        title={
                          <div className="tooltip">
                            Evolution compared to the previous year
                          </div>
                        }
                        arrow
                        placement="right"
                      >
                        <InfoOutlined className="emissions-widget__icon trend-icon" />
                      </Tooltip>
                    </div>
                  )}
                </div>
                <div>
                  <span className={isMobile ? "emissions-widget-mobile__emissions-description" : "emissions-widget__emissions-description"}>
                    Total GHG Emissions <br /> Mt CO2e
                  </span>
                </div>
              </div>
              {current.type !== "site" && !isMobile && (
                <div className="emissions-widget__emissions-data data-per-capita">
                  <div className="icon-wrapper">
                    <MdOutlinePeopleAlt className="people-alt-icon" />
                  </div>
                  <div>
                    <div className="emissions-widget__col-1">
                      <div data-testid="percapita" className="emissions-widget__row">
                        {perCapita ? (
                          <div>
                            <span data-testid="percapita-value"  className="emissions-widget__total-tonnes-pc">
                              {perCapita.toPrecision(3)}
                            </span>
                            <span className="emissions-widget__emissions-pc-unit">
                              T
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="emissions-widget__total-tonnes-pc no-data">
                              N/A
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="emissions-widget__emissions-trend">
                        {
                          !isMobile &&
                            <Tooltip
                              classes={{
                                tooltip: classes.customTooltip,
                                arrow: classes.customArrow,
                              }}
                              title={
                                <div className="tooltip">
                                  Calculated by Open Climate
                                </div>
                              }
                              arrow
                              placement="right"
                            >
                              <InfoOutlined className="emissions-widget__icon trend-icon" />
                            </Tooltip>
                        }
                      </div>
                    </div>
                    <div>
                      {
                        !isMobile &&
                        <>
                        <div className="emissions-widget__emissions-description pc-text">
                        Emissions
                        </div>
                        <div className="emissions-widget__emissions-description pc-text">
                          per capita
                        </div>
                      </>
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div role="methodologies" className={isMobile ? "emissions-widget-mobile__methodologies" :  "emissions-widget__methodologies"}>
              { isMobile && 
                <div className="emissions-widget-mobile__emissions-data data-per-capita">
                  <div className="icon-wrapper">
                    <MdOutlinePeopleAlt className="people-alt-icon" />
                  </div>
                  <div>
                    <div className="emissions-widget-mobile__col-1">
                      <div className="emissions-widget__row">
                        {perCapita ? (
                          <div>
                            <span className="emissions-widget-mobile__total-tonnes-pc">
                              {perCapita.toPrecision(3)}
                            </span>
                            <span className="emissions-widget-mobile__emissions-pc-unit">
                              T
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="emissions-widget__total-tonnes-pc no-data">
                              N/A
                            </span>
                          </div>
                        )}
                      </div>
                      </div>
                  </div>
                  </div>
              }
              {
                isMobile &&
                <>
                  <div className="emissions-widget-mobile__emissions-description pc-text">
                  Emissions per capita
                  </div>
                  <div className="emissions-widget-mobile__emissions-description oc-text">
                    Calculated by <b>OpenClimate</b>
                  </div>
                </>
              }
              <div className={isMobile ? "emissions-widget-mobile__methodologies-heading" :  "emissions-widget__methodologies-heading"}>
                <span>Methodologies used</span>
                {
                  !isMobile && 
                    <Tooltip
                      classes={{
                        tooltip: classes.customTooltip,
                        arrow: classes.customArrow,
                      }}
                      title={
                        <div className="tooltip">
                          Type of methodologies utilized by the selected data source
                        </div>
                      }
                      arrow
                      placement="right"
                    >
                      <InfoOutlined className="emissions-widget__icon methodologies-icon" />
                    </Tooltip>
                }
              </div>
              <div className="emissions-widget__methodologies-tags">
                {tags.slice(0, 3).map((tag: any) => (
                  <div
                    key={`emissions-tag-${tag.tag_id}`}
                    className="methodologies-tag"
                  >
                    {tag.tag_name.length > 24 ? (
                      <Tooltip
                        sx={{left: "0px"}}
                        classes={{
                          tooltip: classes.customTooltip,
                          arrow: classes.customArrow,
                        }}
                        title={<div className="tooltip">{tag.tag_name}</div>}
                        arrow
                        placement="top"
                      >
                        <span  data-testid="methodology-tag" className="methodologies-text">{tag.tag_name}</span>
                      </Tooltip>
                    ) : (
                      <span className="methodologies-text">{tag.tag_name}</span>
                    )}
                  </div>
                ))}
                {tags.slice(3).length > 0 && (
                  <Tooltip
                    classes={{
                      tooltip: classes.customTooltip,
                      arrow: classes.customArrow,
                    }}
                    title={<div className="tooltip">
                      <ul className="methodologies-tooltip-tagname">
                        {
                          tags.slice(3).map((tag:any) => <li key={tag.tag_id} style={{marginLeft:"-20px"}}>{tag.tag_name}</li>)
                        }
                      </ul>
                    </div>}
                    arrow
                    placement="right"
                  >
                    <div className="methodologies-tag overflow-handler">
                      <span className="methodologies-text">
                        +{tags.slice(3).length}
                      </span>
                    </div>
                  </Tooltip>
                )}
              </div>
              {
                  current.emissions[currentSource].citation && current.emissions[currentSource].URL &&
                  <div className="citation-container">
                    <a data-testid="citation-url" className="citation-icon" href={current.emissions?.[currentSource]?.URL} target="_blank" rel="noopener noreferrer"><OpenInNew fontSize="inherit"/></a>
                    <div data-testid="citation-text" className="citation-text">Source detail: {current.emissions[currentSource].citation}</div>
                  </div>
              }
            </div>
          </div>
        ) : (
          <div className={isMobile ? "emissions-widget-mobile__wrapper" : "emissions-widget__wrapper"}>
            <div className="emissions-widget__metadata">
              <div>
                <div className="emissions-widget__metadata-inner">
                  <span className={isMobile ? "emissions-widget-mobile__title" : "emissions-widget__title"}>Total emissions</span>
                  <span>
                    <Tooltip
                      classes={{
                        tooltip: classes.customTooltip,
                        arrow: classes.customArrow,
                      }}
                      title={
                        <div className="tooltip">
                          GHG emissions emitted by the selected actor during the
                          selected year, according to the selected source
                        </div>
                      }
                      arrow
                      placement="right"
                    >
                      <InfoOutlined className="emissions-widget__icon info-icon" />
                    </Tooltip>
                  </span>
                </div>
              </div>
              <div className="emissions-widget__metadata-right">
                <div className="emissions-widget__metadata-right-inner">
                  <div className="emissions-widget__source-label">Source</div>
                  <div className="emissions-widget__source-title">
                    <span data-testid="select-source">N/A</span>
                    <MdArrowDropDown className="emissions-widget__icon arrow" />
                  </div>
                </div>
                <div className="emissions-widget__metadata-right-inner">
                  <div className="emissions-widget__source-label">Year</div>
                  <div className="emissions-widget__source-title">
                    <span data-testid="select-year">N/A</span>
                    <MdArrowDropDown className="emissions-widget__icon arrow" />
                  </div>
                </div>
              </div>
            </div>
            <div className={isMobile ? "emissions-widget-mobile__data" : "emissions-widget__data"}>
              <div className="emissions-widget__emissions-empty-state">
                <p>
                  There's no data available, if you have any suggested <br /> data
                  sources or you are a provider please
                </p>

                <button data-testid="collab-btn" className="collaborate-cta-btn">
                  <Diversity3Icon className="collaborate-cta-icon" />
                  <a href="https://docs.google.com/forms/d/e/1FAIpQLSfL2_FpZZr_SfT0eFs_v4T5BsZnrNBbQ4pkbZ51JhJBCcud6A/viewform?pli=1&pli=1">
                    COLLABORATE WITH DATA
                  </a>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Snackbar
        anchorOrigin={{
            horizontal:"center", 
            vertical: "bottom"
        }}
        open={open}
        autoHideDuration={3000}
        message= {message}
      >
        <Alert severity={severity} onClose={() => setOpen(false)} sx={{ width: '600px', backgroundColor:  notificationBackgroundColor}}>
          <div className="snackbar-message-body" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:'space-between',
            width: "490px"
          }}>
            <div>{message}</div>
            {
              downloadError && (
                <button 
                  onClick={()=>handleDownload(actor_id, downloadFileType)}
                  className="snackbar-button" style={{
                    color: 'white',
                    background: 'none',
                    border: 'none',
                    fontWeight: '600'
                  }}>
                    TRY AGAIN
                </button>
              )
            }
          </div>
        </Alert>
      </Snackbar>
    </>
  );
};

export default EmissionsWidget;
