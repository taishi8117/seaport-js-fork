import { BigNumber } from "ethers";
export declare const SEAPORT_CONTRACT_NAME = "Seaport";
export declare const SEAPORT_CONTRACT_VERSION = "1.1";
export declare const OPENSEA_CONDUIT_KEY = "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000";
export declare const OPENSEA_CONDUIT_ADDRESS = "0x1e0049783f008a0085193e00003d00cd54003c71";
export declare const EIP_712_ORDER_TYPE: {
    OrderComponents: {
        name: string;
        type: string;
    }[];
    OfferItem: {
        name: string;
        type: string;
    }[];
    ConsiderationItem: {
        name: string;
        type: string;
    }[];
};
export declare enum OrderType {
    FULL_OPEN = 0,
    PARTIAL_OPEN = 1,
    FULL_RESTRICTED = 2,
    PARTIAL_RESTRICTED = 3
}
export declare enum ItemType {
    NATIVE = 0,
    ERC20 = 1,
    ERC721 = 2,
    ERC1155 = 3,
    ERC721_WITH_CRITERIA = 4,
    ERC1155_WITH_CRITERIA = 5
}
export declare enum Side {
    OFFER = 0,
    CONSIDERATION = 1
}
export type NftItemType = ItemType.ERC721 | ItemType.ERC1155 | ItemType.ERC721_WITH_CRITERIA | ItemType.ERC1155_WITH_CRITERIA;
export declare enum BasicOrderRouteType {
    ETH_TO_ERC721 = 0,
    ETH_TO_ERC1155 = 1,
    ERC20_TO_ERC721 = 2,
    ERC20_TO_ERC1155 = 3,
    ERC721_TO_ERC20 = 4,
    ERC1155_TO_ERC20 = 5
}
export declare const MAX_INT: BigNumber;
export declare const ONE_HUNDRED_PERCENT_BP = 10000;
export declare const NO_CONDUIT = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const KNOWN_CONDUIT_KEYS_TO_CONDUIT: {
    "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000": string;
};
export declare const CROSS_CHAIN_SEAPORT_ADDRESS = "0x00000000006c3852cbef3e08e8df289169ede581";
export declare const DOMAIN_REGISTRY_ADDRESS = "0x000000000DaD0DE04D2B2D4a5A74581EBA94124A";
