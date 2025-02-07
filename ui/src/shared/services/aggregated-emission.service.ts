import IAggregatedEmission from "../../api/models/DTO/AggregatedEmission/IAggregatedEmission";
import { ServerUrls } from "../environments/server.environments";
import { CommonHelper } from "../helpers/common.helper";

function updateAggregatedEmission(
  orgId: string,
  aggregatedEmission: IAggregatedEmission
) {
  return fetch(`${ServerUrls.api}/${orgId}/aggregated-emission`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(aggregatedEmission),
  }).then(CommonHelper.HandleResponse);
}

function allAggregatedEmissionsByOrg(orgId: number) {
  return fetch(`${ServerUrls.api}/${orgId}/aggregated-emission/all`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then(CommonHelper.HandleResponse)
    .then((aggregated: Array<IAggregatedEmission>) => aggregated);
}

function allAggregatedEmissionsByCity(cityId: number) {
  return fetch(`/api/city/2021/${cityId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then(CommonHelper.HandleResponse)
    .then((aggregated: Array<IAggregatedEmission>) => aggregated);
}

function allAggregatedEmissions() {
  return fetch(`${ServerUrls.api}/aggregated-emission/all`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then(CommonHelper.HandleResponse)
    .then((aggregated: Array<IAggregatedEmission>) => aggregated);
}

allAggregatedEmissions();

export const aggregatedEmissionService = {
  updateAggregatedEmission,
  allAggregatedEmissionsByOrg,
  allAggregatedEmissions,
  allAggregatedEmissionsByCity,
};
