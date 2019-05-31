declare namespace MnAcct {

    let MnAcct_Account: CCC_Type;

    interface CCC_Type {
        account_idx: number;
        account_id: string;
        passwd: string;
    }
}

export = MnAcct;