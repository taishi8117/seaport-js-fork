"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldUseMatchForFulfill = exports.generateRandomSaltWithDomain = exports.generateRandomSalt = exports.mapOrderAmountsFromUnitsToFill = exports.mapOrderAmountsFromFilledStatus = exports.totalItemsAmount = exports.areAllCurrenciesSame = exports.mapInputItemToOfferItem = exports.deductFees = exports.feeToConsiderationItem = void 0;
var ethers_1 = require("ethers");
var utils_1 = require("ethers/lib/utils");
var constants_1 = require("../constants");
var item_1 = require("./item");
var merkletree_1 = require("./merkletree");
var multiplyBasisPoints = function (amount, basisPoints) {
    return ethers_1.BigNumber.from(amount)
        .mul(ethers_1.BigNumber.from(basisPoints))
        .div(constants_1.ONE_HUNDRED_PERCENT_BP);
};
var feeToConsiderationItem = function (_a) {
    var fee = _a.fee, token = _a.token, baseAmount = _a.baseAmount, _b = _a.baseEndAmount, baseEndAmount = _b === void 0 ? baseAmount : _b;
    return {
        itemType: token === ethers_1.ethers.constants.AddressZero ? constants_1.ItemType.NATIVE : constants_1.ItemType.ERC20,
        token: token,
        identifierOrCriteria: "0",
        startAmount: multiplyBasisPoints(baseAmount, fee.basisPoints).toString(),
        endAmount: multiplyBasisPoints(baseEndAmount, fee.basisPoints).toString(),
        recipient: fee.recipient,
    };
};
exports.feeToConsiderationItem = feeToConsiderationItem;
var deductFees = function (items, fees) {
    if (!fees) {
        return items;
    }
    var totalBasisPoints = fees.reduce(function (accBasisPoints, fee) { return accBasisPoints + fee.basisPoints; }, 0);
    return items.map(function (item) { return (__assign(__assign({}, item), { startAmount: (0, item_1.isCurrencyItem)(item)
            ? ethers_1.BigNumber.from(item.startAmount)
                .sub(multiplyBasisPoints(item.startAmount, totalBasisPoints))
                .toString()
            : item.startAmount, endAmount: (0, item_1.isCurrencyItem)(item)
            ? ethers_1.BigNumber.from(item.endAmount)
                .sub(multiplyBasisPoints(item.endAmount, totalBasisPoints))
                .toString()
            : item.endAmount })); });
};
exports.deductFees = deductFees;
var mapInputItemToOfferItem = function (item) {
    var _a, _b, _c, _d, _e, _f, _g;
    // Item is an NFT
    if ("itemType" in item) {
        // Convert this to a criteria based item
        if ("identifiers" in item) {
            var tree = new merkletree_1.MerkleTree(item.identifiers);
            return {
                itemType: item.itemType === constants_1.ItemType.ERC721
                    ? constants_1.ItemType.ERC721_WITH_CRITERIA
                    : constants_1.ItemType.ERC1155_WITH_CRITERIA,
                token: item.token,
                identifierOrCriteria: tree.getRoot(),
                startAmount: (_a = item.amount) !== null && _a !== void 0 ? _a : "1",
                endAmount: (_c = (_b = item.endAmount) !== null && _b !== void 0 ? _b : item.amount) !== null && _c !== void 0 ? _c : "1",
            };
        }
        if ("amount" in item || "endAmount" in item) {
            return {
                itemType: item.itemType,
                token: item.token,
                identifierOrCriteria: item.identifier,
                // @ts-ignore
                startAmount: item.amount,
                // @ts-ignore
                endAmount: (_e = (_d = item.endAmount) !== null && _d !== void 0 ? _d : item.amount) !== null && _e !== void 0 ? _e : "1",
            };
        }
        return {
            itemType: item.itemType,
            token: item.token,
            identifierOrCriteria: item.identifier,
            startAmount: "1",
            endAmount: "1",
        };
    }
    // Item is a currency
    return {
        itemType: item.token && item.token !== ethers_1.ethers.constants.AddressZero
            ? constants_1.ItemType.ERC20
            : constants_1.ItemType.NATIVE,
        token: (_f = item.token) !== null && _f !== void 0 ? _f : ethers_1.ethers.constants.AddressZero,
        identifierOrCriteria: "0",
        startAmount: item.amount,
        endAmount: (_g = item.endAmount) !== null && _g !== void 0 ? _g : item.amount,
    };
};
exports.mapInputItemToOfferItem = mapInputItemToOfferItem;
var areAllCurrenciesSame = function (_a) {
    var offer = _a.offer, consideration = _a.consideration;
    var allItems = __spreadArray(__spreadArray([], __read(offer), false), __read(consideration), false);
    var currencies = allItems.filter(item_1.isCurrencyItem);
    return currencies.every(function (_a) {
        var itemType = _a.itemType, token = _a.token;
        return itemType === currencies[0].itemType &&
            token.toLowerCase() === currencies[0].token.toLowerCase();
    });
};
exports.areAllCurrenciesSame = areAllCurrenciesSame;
var totalItemsAmount = function (items) {
    var initialValues = {
        startAmount: ethers_1.BigNumber.from(0),
        endAmount: ethers_1.BigNumber.from(0),
    };
    return items
        .map(function (_a) {
        var startAmount = _a.startAmount, endAmount = _a.endAmount;
        return ({
            startAmount: startAmount,
            endAmount: endAmount,
        });
    })
        .reduce(function (_a, _b) {
        var totalStartAmount = _a.startAmount, totalEndAmount = _a.endAmount;
        var startAmount = _b.startAmount, endAmount = _b.endAmount;
        return ({
            startAmount: totalStartAmount.add(startAmount),
            endAmount: totalEndAmount.add(endAmount),
        });
    }, {
        startAmount: ethers_1.BigNumber.from(0),
        endAmount: ethers_1.BigNumber.from(0),
    });
};
exports.totalItemsAmount = totalItemsAmount;
/**
 * Maps order offer and consideration item amounts based on the order's filled status
 * After applying the fraction, we can view this order as the "canonical" order for which we
 * check approvals and balances
 */
var mapOrderAmountsFromFilledStatus = function (order, _a) {
    var totalFilled = _a.totalFilled, totalSize = _a.totalSize;
    if (totalFilled.eq(0) || totalSize.eq(0)) {
        return order;
    }
    // i.e if totalFilled is 3 and totalSize is 4, there are 1 / 4 order amounts left to fill.
    var basisPoints = totalSize
        .sub(totalFilled)
        .mul(constants_1.ONE_HUNDRED_PERCENT_BP)
        .div(totalSize);
    return {
        parameters: __assign(__assign({}, order.parameters), { offer: order.parameters.offer.map(function (item) { return (__assign(__assign({}, item), { startAmount: multiplyBasisPoints(item.startAmount, basisPoints).toString(), endAmount: multiplyBasisPoints(item.endAmount, basisPoints).toString() })); }), consideration: order.parameters.consideration.map(function (item) { return (__assign(__assign({}, item), { startAmount: multiplyBasisPoints(item.startAmount, basisPoints).toString(), endAmount: multiplyBasisPoints(item.endAmount, basisPoints).toString() })); }) }),
        signature: order.signature,
    };
};
exports.mapOrderAmountsFromFilledStatus = mapOrderAmountsFromFilledStatus;
/**
 * Maps order offer and consideration item amounts based on the units needed to fulfill
 * After applying the fraction, we can view this order as the "canonical" order for which we
 * check approvals and balances
 * Returns the numerator and denominator as well, converting this to an AdvancedOrder
 */
var mapOrderAmountsFromUnitsToFill = function (order, _a) {
    var unitsToFill = _a.unitsToFill, totalFilled = _a.totalFilled, totalSize = _a.totalSize;
    var unitsToFillBn = ethers_1.BigNumber.from(unitsToFill);
    if (unitsToFillBn.lte(0)) {
        throw new Error("Units to fill must be greater than 1");
    }
    var maxUnits = (0, item_1.getMaximumSizeForOrder)(order);
    if (totalSize.eq(0)) {
        totalSize = maxUnits;
    }
    // This is the percentage of the order that is left to be fulfilled, and therefore we can't fill more than that.
    var remainingOrderPercentageToBeFilled = totalSize
        .sub(totalFilled)
        .mul(constants_1.ONE_HUNDRED_PERCENT_BP)
        .div(totalSize);
    // i.e if totalSize is 8 and unitsToFill is 3, then we multiply every amount by 3 / 8
    var unitsToFillBasisPoints = unitsToFillBn
        .mul(constants_1.ONE_HUNDRED_PERCENT_BP)
        .div(maxUnits);
    // We basically choose the lesser between the units requested to be filled and the actual remaining order amount left
    // This is so that if a user tries to fulfill an order that is 1/2 filled, and supplies a fraction such as 3/4, the maximum
    // amount to fulfill is 1/2 instead of 3/4
    var basisPoints = remainingOrderPercentageToBeFilled.gt(unitsToFillBasisPoints)
        ? unitsToFillBasisPoints
        : remainingOrderPercentageToBeFilled;
    return {
        parameters: __assign(__assign({}, order.parameters), { offer: order.parameters.offer.map(function (item) { return (__assign(__assign({}, item), { startAmount: multiplyBasisPoints(item.startAmount, basisPoints).toString(), endAmount: multiplyBasisPoints(item.endAmount, basisPoints).toString() })); }), consideration: order.parameters.consideration.map(function (item) { return (__assign(__assign({}, item), { startAmount: multiplyBasisPoints(item.startAmount, basisPoints).toString(), endAmount: multiplyBasisPoints(item.endAmount, basisPoints).toString() })); }) }),
        signature: order.signature,
    };
};
exports.mapOrderAmountsFromUnitsToFill = mapOrderAmountsFromUnitsToFill;
var generateRandomSalt = function () {
    return "0x".concat(Buffer.from((0, utils_1.randomBytes)(8)).toString("hex").padStart(24, "0"));
};
exports.generateRandomSalt = generateRandomSalt;
var generateRandomSaltWithDomain = function (domain) {
    return "0x".concat(Buffer.from((0, utils_1.concat)([
        (0, utils_1.keccak256)((0, utils_1.toUtf8Bytes)(domain)).slice(0, 10),
        Uint8Array.from(Array(20).fill(0)),
        (0, utils_1.randomBytes)(8),
    ])).toString("hex"));
};
exports.generateRandomSaltWithDomain = generateRandomSaltWithDomain;
var shouldUseMatchForFulfill = function () { return true; };
exports.shouldUseMatchForFulfill = shouldUseMatchForFulfill;
//# sourceMappingURL=order.js.map