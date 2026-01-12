import React from "react";
import ProgramCompareV2Client from "./ProgramCompareV2Client";
import { getCompareV2Data } from "./getCompareV2Data";

type Props = {
  page?: number;
};

export default async function ProgramCompareV2(_props: Props) {
  const { programs, params, values } = await getCompareV2Data();

  return (
    <ProgramCompareV2Client programs={programs} params={params} values={values} />
  );
}
