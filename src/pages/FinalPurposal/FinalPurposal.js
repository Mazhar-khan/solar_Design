import React, { useState } from "react";
import Final from '../FinalResult/Final';
import SolarEstimated from '../FinalResult/SolarEstimated';
import Graph from '../FinalResult/Graph';
import ProposalHeader from "../FinalResult/ProposalHeader";

export default function FinalPurposal() {

    return (
        <>
          <ProposalHeader />
          
            <Final />
            <SolarEstimated />
            <Graph />

        </>
    )
}
