


// namespace Meb {
//     export interface sp_create {
//         idx: number;
//     }
// }

interface create {
    idx: number;
    title: string
}


interface Meb {
    sp_create: create;
}


class Auto_Meb  implements Meb {

    sp_create = {
        idx: 1,
        title: "2"
    };

    constructor() {
        this.sp_create.idx; // idx 값 설정함
    }
    
}



let my = new Auto_Meb();

my.


