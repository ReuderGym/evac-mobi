export const _SIN2_VIEWS_IDS = {
    statuses: 'sin2:/v:4322c7ce-8c95-4f6c-98f1-108f3cf2365c',
    parkings: 'sin2:/v:944fe174-bfac-4778-b2b7-643f588c6969',
    evacs:    'sin2:/v:bdc92a44-76fd-462a-8d3b-7611f2315d8c/?filter=and(isnull(field(".endDt")),eq(field(".vcTypeID"), param("e30d37ea-7f3f-4b51-9b4d-840b702a9ec4","id")))',
    causes:   'sin2:/v:9acb3853-b211-4f0e-8342-870815aa9be8',
    vcmarks:  'sin2:/v:f0229c5d-a121-4c4a-90a8-eae854f9f272/?sort=evacVehicleKindName.vehicleKindName',
    cities:   'sin2:/v:ce31059a-9f3d-4e36-a72d-d79bc1332bf9/',
    transport:'sin2:/v:f9b71490-6635-4f2f-b2b3-d4ed8a90b0c2/?sort=-evacoffensejournal.regnum'
};

const _sin2objNq = ( sin2res ) => {
    const {fields, data} = sin2res;
    if (
            (!!data)
         && Array.isArray(data)
       ){
       var res = [];
       data.forEach( d => {
           var o = {};
           fields.forEach( (f, n) => {
               o[f] = d[n];
           });
           res.push(o);
       });
       return res;
    } else {
        return null;
    }
};

/**
 * Map sin2 result to json-plain obj`s
 * @param {Object} result of sin2 jsonRps query
 * @returns {Array|sin2obj.res}
 */
export const sin2obj = ( sin2res ) => {
    if (!sin2res.columnIndexes){
        return _sin2objNq(sin2res);
    }
    
    const {columnIndexes, data} = sin2res;
    if (
            (!!data)
         && Array.isArray(data)
       ){
        const keys = Object.keys(columnIndexes);
        var res = [];
        data.forEach( e => {
            var s, n, o = {};
            keys.map( key => {
                n = key.split('.');
                s = (n.length === 1) 
                        ? n[0]
                        : (n.length === 2) 
                            ? n[1]
                            : n.map( (_n, i) => (i===0) ? _n : _n.charAt(0).toUpperCase() + _n.substr(1) ).join("");
                o[s] = e[columnIndexes[key]];
            });
            res.push(o);
        });
        return res;
    } else {
        return null;
    }
};

export const state = ()=>({
    statuses: null,
    parkings: null,
    evacs: null,
    causes: null,
    vcmarks: null,
    cities:  null,
    transport: null
});

export const mutations = {
    set(state, payload) {
        Object.keys(payload).map( k => {
            state[k] = payload[k];
        });
    }
};

export const actions = {
    read({ commit, state }, payload) {
        return new Promise( async (resolve, reject) => {
            if (state[payload]){
                resolve();
            } else {
                try {
                    const opts = {
                        type: 'core-read',
                        query: _SIN2_VIEWS_IDS[payload]
                    };
                    const res = await $nuxt.api(opts);
                    if (!!res.error){
                        throw res.error;
                    }
                    const o = {};
                    o[payload] = sin2obj(res.result);
                    commit("set", o);
                    resolve();
                } catch(e) {
                    console.log('ERR (data/read)', e);
                    reject(e);
                }
            }
        });
    },  //read
    transport({ state }, payload) {
        return new Promise( async (resolve, reject) => {
            try {
                const opts = {
                    type: 'core-read',
                    query: _SIN2_VIEWS_IDS.transport
                };
                const n = opts.query.lastIndexOf("/");
                opts.query = `${ opts.query.substr(0, n) }/?id=${ payload }`;
                        
                const res = await $nuxt.api(opts);
                if (!!res.error){
                    throw res.error;
                }
                const o = sin2obj(res.result);
                resolve(o);
            } catch(e) {
                console.log('ERR (data/read)', e);
                reject(e);
            }
        });
    }
};