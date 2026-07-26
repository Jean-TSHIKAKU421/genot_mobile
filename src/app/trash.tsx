// ==========================================
// trash.tsx
// ==========================================
import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

const API_URL = 'https://jtt.alwaysdata.net/api';

async function apiFetch(url, options = {}) {
    const token = await AsyncStorage.getItem('token');
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    return fetch(url, { ...options, headers });
}

export default function TrashScreen() {
    const [cs,scs] = useState([]); const [ns,sns] = useState([]); const [ld,sld] = useState(true); const [th,sth] = useState('dark');
    const dk=th==='dark';const cl={bg:dk?'#020617':'#f0f2f5',cd:dk?'#0f172a':'#ffffff',tx:dk?'#f1f5f9':'#1a1a2e',ts:dk?'#94a3b8':'#64748b',bd:dk?'rgba(99,102,241,0.2)':'#e2e8f0',ib:dk?'rgba(255,255,255,0.05)':'#f8fafc',pr:'#6366f1',sc:'#10b981',dg:'#ef4444'};
    useFocusEffect(useCallback(()=>{ld2()},[]));
    const ld2=async()=>{const u=await AsyncStorage.getItem('currentUser');if(!u){router.replace('/');return}const ud=JSON.parse(u);try{const r=await apiFetch(`${API_URL}/trash/${ud.matricule}`);const d=await r.json();if(d.success){scs(d.courses);sns(d.notes)}}catch(e){}sld(false)};
    const ri=async(t,id)=>{try{await apiFetch(`${API_URL}/trash/restore/${t}/${id}`,{method:'POST'});ld2()}catch(e){Alert.alert('Erreur','Impossible de restaurer.')}};
    const pd=(t,id)=>{Alert.alert('Suppression définitive','Cette action est irréversible !',[{text:'Annuler',style:'cancel'},{text:'Supprimer',style:'destructive',onPress:async()=>{await apiFetch(`${API_URL}/trash/permanent/${t}/${id}`,{method:'DELETE'});ld2()}}])};
    const et=()=>{Alert.alert('Vider la corbeille','Tout supprimer définitivement ?',[{text:'Annuler',style:'cancel'},{text:'Vider',style:'destructive',onPress:async()=>{const u=await AsyncStorage.getItem('currentUser');const ud=JSON.parse(u);await apiFetch(`${API_URL}/trash/empty/${ud.matricule}`,{method:'POST'});ld2()}}])};
    const ti=cs.length+ns.length;
    if(ld)return<View style={[ss.ct,{backgroundColor:cl.bg}]}><Text style={{color:cl.tx,textAlign:'center',marginTop:100}}>Chargement...</Text></View>;
    return(
        <View style={[ss.ct,{backgroundColor:cl.bg}]}>
            <View style={[ss.hd,{backgroundColor:cl.cd,borderBottomColor:cl.bd}]}>
                <TouchableOpacity onPress={()=>router.back()} style={ss.hb}><FontAwesome5 name="arrow-left" size={18} color={cl.pr}/></TouchableOpacity>
                <Text style={[ss.ht,{color:cl.tx}]}><FontAwesome5 name="trash-alt" size={16} color={cl.pr}/> Corbeille</Text>
                {ti>0?<TouchableOpacity onPress={et}><Text style={{color:cl.dg,fontSize:13,fontWeight:'600'}}>Vider</Text></TouchableOpacity>:<View style={{width:40}}/>}
            </View>
            <FlatList data={[...cs.map(c=>({...c,it:'course'})),...ns.map(n=>({...n,it:'note'}))]} keyExtractor={item=>`${item.it}-${item.id}`} contentContainerStyle={ss.ls}
                ListEmptyComponent={<View style={[ss.es,{backgroundColor:cl.cd,borderColor:cl.bd}]}><FontAwesome5 name="trash-alt" size={50} color={cl.ts} style={{marginBottom:12}}/><Text style={[ss.et,{color:cl.tx}]}>Corbeille vide</Text><Text style={[ss.etx,{color:cl.ts}]}>Aucun élément supprimé</Text></View>}
                renderItem={({item})=>(
                    <View style={[ss.ti,{backgroundColor:cl.cd,borderColor:cl.bd}]}>
                        <View style={[ss.tic,{backgroundColor:item.it==='course'?'rgba(99,102,241,0.1)':'rgba(16,185,129,0.1)'}]}><FontAwesome5 name={item.it==='course'?'book':'sticky-note'} size={20} color={item.it==='course'?cl.pr:cl.sc}/></View>
                        <View style={ss.tif}>
                            <Text style={[ss.tit,{color:cl.tx}]} numberOfLines={1}>{item.title}</Text>
                            <Text style={[ss.tim,{color:cl.ts}]}>{item.it==='course'?'Cours':`Cours: ${item.course_title||''}`} • {new Date(item.deleted_at).toLocaleDateString('fr-FR')}</Text>
                        </View>
                        <View style={ss.tia}>
                            <TouchableOpacity style={[ss.rbn,{backgroundColor:cl.sc}]} onPress={()=>ri(item.it,item.id)}><FontAwesome5 name="undo" size={14} color="#fff"/></TouchableOpacity>
                            <TouchableOpacity style={[ss.dbn,{backgroundColor:cl.dg}]} onPress={()=>pd(item.it,item.id)}><FontAwesome5 name="trash-alt" size={14} color="#fff"/></TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const ss=StyleSheet.create({
    ct:{flex:1},hd:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:14,paddingTop:50,borderBottomWidth:1},hb:{width:40,height:40,justifyContent:'center',alignItems:'center'},ht:{fontSize:18,fontWeight:'700'},
    ls:{padding:14,paddingBottom:40},ti:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderRadius:14,marginBottom:8,borderWidth:1},
    tic:{width:44,height:44,borderRadius:12,justifyContent:'center',alignItems:'center'},tif:{flex:1},tit:{fontSize:14,fontWeight:'600',marginBottom:2},tim:{fontSize:11},
    tia:{flexDirection:'row',gap:6},rbn:{width:38,height:38,borderRadius:19,justifyContent:'center',alignItems:'center'},dbn:{width:38,height:38,borderRadius:19,justifyContent:'center',alignItems:'center'},
    es:{alignItems:'center',padding:50,borderRadius:20,borderWidth:1},et:{fontSize:18,fontWeight:'700',marginBottom:6},etx:{fontSize:13},
});