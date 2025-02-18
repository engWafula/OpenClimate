import { FunctionComponent, useEffect, useState } from "react";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { DonutChart } from "react-circle-chart";
import { Close } from "@mui/icons-material";
import { FilterTypes } from "../../api/models/review/dashboard/filterTypes";
import { deselectFilter } from "../../store/review/review.actions";
import { readableEmissions, readablePercentagePopulation } from "../util/units";
import { showPopulationParent } from "../util/population";
import Bg from "./img/Flag.png";
import ActorFlag from "./actor-flag/actor-flag";

interface IProps {
  parent: any;
  current: any;
  label: string;
  isActive: boolean;
  onDeSelect?: () => void;
}

// Detect window

function getWinSize() {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
}

const IndicatorCard: FunctionComponent<IProps> = (props) => {
  const { parent, current, label, isActive, onDeSelect } = props;
  const [cardData, setCardData] = useState<any>({});
  const [emsData, setEmissionsData] = useState<any>();
  const [currentPopulation, setCurrPopulation] = useState<number>();
  const [parentPopulation, setParPopulation] = useState<number>();
  const [targetsData, setTargetsData] = useState<any>(null);
  const [year, setYear] = useState<number>();

  // Detect window sise to resize the donut chart

  const [winSize, setWinSize] = useState(getWinSize());
  const [donutSize, setDonutSize] = useState(22);
  useEffect(() => {
    function handleWinResize() {
      setWinSize(getWinSize());
    }

    window.addEventListener("resize", handleWinResize);
  }, []);

  useEffect(() => {
    if (winSize.innerWidth > 1550) {
      setDonutSize(30);
    } else {
      setDonutSize(22);
    }
  }, [winSize.innerWidth, donutSize]);

  // Donut earth props items
  const items = [
    {
      value: 32,
      label: "Total",
      color: "#D9D9D9",
    },
    {
      value: 68,
      label: "Difference",
      color: "#FA7200",
    },
  ];
  const items2 = [
    {
      value: 90,
      label: "Total",
      color: "#D9D9D9",
    },
    {
      value: 10,
      label: "Difference",
      color: "#2351DC",
    },
  ];

  useEffect(() => {
    if (parent == null) {
      const u = current;
      setCardData(u);
    } else {
      const u = current;
      setCardData(u);
      const sources =
        u && current.emissions ? Object.keys(current.emissions) : [];
      sources.sort();
      const defaultSource = sources.length > 0 ? sources[0] : null;
      const defaultYear =
        defaultSource && current.emissions[defaultSource].data.length > 0
          ? current.emissions[defaultSource].data[0].year
          : null;
      const latestYear = defaultYear;
      setYear(latestYear);
      const currentEmissions =
        defaultSource && defaultYear
          ? current.emissions[defaultSource].data.find(
              (e: any) => e.year == latestYear
            )
          : null;
      const latestPopulation =
        current && current.population && current.population.length > 0
          ? current.population[0]
          : null;
      const populationYear = latestPopulation?.datasource?.published.slice(
        0,
        4
      );
      const population =
        populationYear && current.population.length
          ? current.population
              .slice()
              .sort((p: any) => Math.abs(p.year - populationYear))
              .find((p: any) => Math.abs(p.year - populationYear) <= 5)
          : null;
      const parentPopulation =
        populationYear && parent.population.length
          ? parent.population
              .slice()
              .sort((p: any) => Math.abs(p.year - populationYear))
              .find((p: any) => Math.abs(p.year - populationYear) <= 5)
          : null;
      const target =
        current?.targets.length > 0
          ? current?.targets?.filter(
              (target) => target.target_year > new Date().getFullYear()
            )?.[0]
          : null;

      setCurrPopulation(population?.population);
      setParPopulation(parentPopulation?.population);
      setEmissionsData(currentEmissions?.total_emissions);
      target && setTargetsData(target);
    }
  }, [cardData, emsData, current, parent]);

  function isEarth() {
    return current?.type === 'planet'
  }

  return (
    <div className="review__earth-card-wrapper">
      <div className="review__actor-type" data-testid="label">{label || ""}</div>
      <div
        className={
          isActive ? "review__earth-card-active" : "review__earth-card-inactive"
        }
        data-testid="activity-wrapper"
      >
        <div className="review__earth-card-head">
          <div className="review__earth-flag">
            {
              isEarth() ? (
                <>
                  <img src={Bg} alt="Earth Icon" className="review__earth-icon"/>
                </>
              ) : (
                <ActorFlag
                  currentActorId={current?.actor_id}
                  currentActorType={current?.type}
                  parentActorId={parent?.actor_id}
                  icon={current?.icon}
                />
              )
            }
          </div>
          <span className="review__earth-card-item-head-text-span" data-testid="title">
            {cardData?.name ?? ""}
          </span>
          {onDeSelect && (
            <Close
              className="review__earth-card-close-icon hdn-xsm"
              onClick={onDeSelect}
            />
          )}
        </div>
        <div className="review__earth-card-body">
          <div className="review__earth-card-content"  data-testid="emissions-info">
            <div className="review__earth-card-emissions-info">
              <MdArrowUpward
                className="review__earth-card-item-icon"
                style={
                  !emsData && !isEarth()
                    ? { color: "#7A7B9A" }
                    : { color: "#F23D33" }
                }
              />
              <span
                className="review__earth-card-item-large-text"
                style={
                  !emsData && !isEarth()
                    ? { color: "#7A7B9A" }
                    : { color: "#00001F" }
                }
              >
                {!emsData && !isEarth()
                  ? "N/A"
                  : (emsData && readableEmissions(emsData, "array")[0]) ||
                    "49.8"}
              </span>
              {!emsData && !isEarth() ? (
                <></>
              ) : (
                <span className="review__earth-card-item-small-text">
                  {isEarth()
                    ? "GtCO"
                    : `${readableEmissions(emsData, "array")[1]}CO`}
                  <sub>2</sub>e
                </span>
              )}
            </div>
            <div
              className="review__earth-card-item-normal-text earth-card-normal-text"
              style={
                !emsData && !isEarth()
                  ? { color: "#7A7B9A" }
                  : { color: "#00001F" }
              }
            >
              {!emsData && parent
                ? "No data available"
                : `in ${!isEarth() ? year || "N/A" : "2019"}`}
            </div>
          </div>
          {parent ? (
            ""
          ) : (
            <div className="review__earth-card-content donut-card hdn-xsm" data-testid='carbon-budget'>
              <div className="donut">
                <DonutChart
                  items={items}
                  size={donutSize}
                  showTotal={false}
                  tooltipSx={{ display: "none" }}
                  trackColor="#D9D9D9"
                />
              </div>
              <div className="right-column">
                <div>
                  <span className="review__earth-card-item-large-text">
                    287.4
                  </span>
                  <span className="review__earth-card-item-small-text">
                    GtCO<sub>2</sub>e
                  </span>
                </div>
                <div className="review__earth-card-item-normal-text target-text">
                  Left based on 1.5 target
                </div>
              </div>
            </div>
          )}
          <div
            className="review__earth-card-content hdn-xsm"
            style={{ position: "relative", top: parent ? "85px" : "0px" }}
          >
            {parent ? (
              <>
                <div
                  className={`review__earth-card-pledge-info ${
                    parent && winSize.innerWidth <= 1550 ? "min" : ""
                  }`}
                >
                  <MdArrowDownward
                    className="review__earth-card-item-icon"
                    style={{
                      color: targetsData ? "#008600" : "#7A7B9A",
                      transform: "rotate(-45deg)",
                    }}
                  />
                  <span
                    className="review__earth-card-item-large-text"
                    style={
                      targetsData ? { color: "#00001F" } : { color: "#7A7B9A" }
                    }
                  >
                    {targetsData?.target_unit == "percent"
                      ? `${targetsData?.target_value}%`
                      : targetsData?.target_unit == "tCO2e"
                      ? `${readableEmissions(targetsData?.target_value)}`
                      : "N/A"}
                  </span>
                  <span className="review__earth-card-item-small-text"></span>
                </div>
                <div
                  className={`review__earth-card-item-normal-text earth-card-normal-text ${
                    parent && winSize.innerWidth <= 1550 ? "min" : ""
                  }`}
                  style={
                    targetsData ? { color: "#00001F" } : { color: "#7A7B9A" }
                  }
                >
                  {targetsData
                    ? `Pledged by ${targetsData?.target_year} relative to ${
                        targetsData?.baseline_year == targetsData?.target_year
                          ? "BAU"
                          : targetsData?.baseline_year
                      }`
                    : "No data available"}{" "}
                </div>
              </>
            ) : (
              <div className="co2-history" data-testid="co2-history">
                <MdArrowUpward className="review__earth-card-item-icon" />
                <div>
                  <span className="review__earth-card-item-large-text">
                    1.1 <sup>o</sup>C
                  </span>
                  <div className="review__earth-card-item-normal-text">
                    Temperature <br /> since 1880
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className="review__earth-card-content donut-card co2concentration hdn-xsm"
            style={{ position: "relative", left: parent ? "-10px" : "0px" }}
          >
            {parent ? (
              <>
                <div className="donut">
                  <DonutChart
                    items={
                      currentPopulation && parentPopulation
                        ? [
                            {
                              ...items2[0],
                              value:
                                100 -
                                (currentPopulation / parentPopulation) * 100,
                            },
                            {
                              ...items2[1],
                              value:
                                (currentPopulation / parentPopulation) * 100,
                            },
                          ]
                        : [{ value: 0, label: "", color: "#D9D9D9" }]
                    }
                    size={donutSize}
                    showTotal={false}
                    tooltipSx={{ display: "none" }}
                    trackColor="#D9D9D9"
                  />
                </div>
                <div className="right-column">
                  <div>
                    <span
                      className="review__earth-card-item-large-text"
                      style={
                        currentPopulation && parentPopulation
                          ? { color: "#00001F" }
                          : { color: "#7A7B9A" }
                      }
                    >
                      {currentPopulation && parentPopulation
                        ? readablePercentagePopulation(
                            currentPopulation,
                            parentPopulation
                          )
                        : "N/A"}
                      %
                    </span>
                    <span className="review__earth-card-item-small-text"></span>
                  </div>
                  <div
                    className="review__earth-card-item-normal-text target-text"
                    style={
                      currentPopulation && parentPopulation
                        ? { color: "#00001F" }
                        : { color: "#7A7B9A" }
                    }
                  >
                    {currentPopulation && parentPopulation
                      ? `Of ${showPopulationParent(label)}'s Population`
                      : "No available data"}
                  </div>
                </div>
              </>
            ) : (
              <div className="co2-concentration-content" data-testid="co2-concentration-content">
                <MdArrowUpward className="review__earth-card-item-icon-b" />
                <div className="">
                  <div>
                    <span className="review__earth-card-item-large-text">
                      415.3
                    </span>
                    <span className="review__earth-card-item-small-text">
                      ppm
                    </span>
                  </div>
                  <div className="review__earth-card-item-normal-text">
                    atmospheric CO<sub>2 </sub>concentration
                  </div>
                </div>
              </div>
            )}
          </div>
          {onDeSelect && (
            <Close
              className="review__earth-card-close-icon mobile-close-icon"
              onClick={onDeSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default IndicatorCard;
