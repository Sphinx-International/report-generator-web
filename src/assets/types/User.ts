export type User = {
    first_name:string,
    last_name:string,
    email:string,
    id:number,
    groups: string[],
    is_superuser:boolean,
    last_login:null,
    role: 0 |1 | 2,
    user_permissions: string[]
}