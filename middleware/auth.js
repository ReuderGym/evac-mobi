export default async (context) => {
    const { store, redirect } = context;
    
    try {
        const r = await store.dispatch("profile/check");
    } catch(e){
        console.log('ERR (md:auth)', e);
        redirect("/auth");
    }
};