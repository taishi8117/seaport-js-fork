import { BigNumber, BigNumberish } from "ethers";
import type { ConsiderationItem, CreateInputItem, Fee, Item, OfferItem, Order, OrderParameters } from "../types";
export declare const feeToConsiderationItem: ({ fee, token, baseAmount, baseEndAmount, }: {
    fee: Fee;
    token: string;
    baseAmount: BigNumberish;
    baseEndAmount?: BigNumberish | undefined;
}) => ConsiderationItem;
export declare const deductFees: <T extends Item>(items: T[], fees?: readonly Fee[]) => T[];
export declare const mapInputItemToOfferItem: (item: CreateInputItem) => OfferItem;
export declare const areAllCurrenciesSame: ({ offer, consideration, }: Pick<OrderParameters, "offer" | "consideration">) => boolean;
export declare const totalItemsAmount: <T extends OfferItem>(items: T[]) => {
    startAmount: BigNumber;
    endAmount: BigNumber;
};
/**
 * Maps order offer and consideration item amounts based on the order's filled status
 * After applying the fraction, we can view this order as the "canonical" order for which we
 * check approvals and balances
 */
export declare const mapOrderAmountsFromFilledStatus: (order: Order, { totalFilled, totalSize }: {
    totalFilled: BigNumber;
    totalSize: BigNumber;
}) => Order;
/**
 * Maps order offer and consideration item amounts based on the units needed to fulfill
 * After applying the fraction, we can view this order as the "canonical" order for which we
 * check approvals and balances
 * Returns the numerator and denominator as well, converting this to an AdvancedOrder
 */
export declare const mapOrderAmountsFromUnitsToFill: (order: Order, { unitsToFill, totalFilled, totalSize, }: {
    unitsToFill: BigNumberish;
    totalFilled: BigNumber;
    totalSize: BigNumber;
}) => Order;
export declare const generateRandomSalt: () => string;
export declare const generateRandomSaltWithDomain: (domain: string) => string;
export declare const shouldUseMatchForFulfill: () => boolean;
