import { providers as multicallProviders } from "@0xsequence/multicall";
import { BigNumber, Signer } from "ethers";
import type { ApprovalAction, Item } from "../types";
import type { InsufficientApprovals } from "./balanceAndApprovalCheck";
export declare const approvedItemAmount: (owner: string, item: Item, operator: string, multicallProvider: multicallProviders.MulticallProvider) => Promise<BigNumber>;
/**
 * Get approval actions given a list of insufficent approvals.
 */
export declare function getApprovalActions(insufficientApprovals: InsufficientApprovals, signer: Signer): Promise<ApprovalAction[]>;
