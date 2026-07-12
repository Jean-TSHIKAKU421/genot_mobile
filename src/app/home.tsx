// ==========================================
// home.tsx
// ==========================================
import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import ModalConfirm from '../components/ModalConfirm';
const API_URL = 'https://jtt.alwaysdata.net/api';
const PH = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
export default function HomeScreen() {
    const [u,su] = useState(null); const [cs,scs] = useState([]); const [rd,srd] = useState(false); const [th,sth] = useState('dark'); const [st,sst] = useState(''); const [fc,sfc] = useState([]); const [il,sil] = useState(false);
    const [vaultActive, svaultActive] = useState(false);
    const [confirmVis, setConfirmVis] = useState(false); const [confirmDel, setConfirmDel] = useState(false); const [selId, setSelId] = useState(null); const [selHidden, setSelHidden] = useState(false);
    useEffect(()=>{AsyncStorage.getItem('theme').then(t=>{if(t)sth(t)});},[]);
    const tt=async()=>{const nt=th==='dark'?'light':'dark';sth(nt);await AsyncStorage.setItem('theme',nt)};
    const dk=th==='dark';const cl={bg:dk?'#020617':'#f0f2f5',cd:dk?'#0f172a':'#ffffff',tx:dk?'#f1f5f9':'#1a1a2e',ts:dk?'#94a3b8':'#64748b',bd:dk?'rgba(99,102,241,0.2)':'#e2e8f0',ib:dk?'rgba(255,255,255,0.05)':'#f8fafc',pr:'#6366f1',dg:'#ef4444',wn:'#f59e0b',sc:'#10b981'};
    useFocusEffect(useCallback(()=>{ld()},[]));
    const ld=async()=>{const uu=await AsyncStorage.getItem('currentUser');if(!uu){router.replace('/');return}const ud=JSON.parse(uu);su(ud);fetch(`${API_URL}/visits`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({platform:'mobile',page:'home',matricule:ud.matricule})}).catch(()=>{});try{const r=await fetch(`${API_URL}/vault/verify`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({matricule:ud.matricule,password:'test'})});const d=await r.json();svaultActive(d.message!=='Coffre-fort non configuré.');const r2=await fetch(`${API_URL}/courses/${ud.matricule}`);const d2=await r2.json();if(d2.success)scs(d2.courses)}catch(e){}srd(true)};
    const gp=(name)=>{if(!name)return'Utilisateur';const w=name.trim().split(/\s+/);return w.length>1?w[w.length-1]:w[0]};
    const hs=(t)=>{sst(t);if(!t.trim()){sfc([]);return}const tl=t.toLowerCase().trim();sfc(cs.filter(c=>(c.title||'').toLowerCase().includes(tl)||(c.professor||'').toLowerCase().includes(tl)||(c.description||'').toLowerCase().includes(tl)))};
    const ts2=async()=>{if(il){sil(false);return}try{const{default:SR}=await import('expo-speech-recognition');sil(true);const r=await SR.startListening({language:'fr-FR',continuous:false});if(r&&r.transcript){sst(r.transcript);hs(r.transcript)}}catch(e){Alert.alert('Info','Micro non disponible.')}finally{sil(false)}};
    const dc=(id)=>{setSelId(id);setConfirmDel(true)};
    const doDelete=async()=>{setConfirmDel(false);if(selId){await fetch(`${API_URL}/courses/${selId}`,{method:'DELETE'});ld()}};
    const toggleVis=(id)=>{const c=cs.find(x=>x.id===id);if(!vaultActive){Alert.alert('Info','Configurez d\'abord le coffre-fort dans les paramètres.');return}setSelId(id);setSelHidden(c?.hidden||false);setConfirmVis(true)};
    const doToggleVis=async()=>{setConfirmVis(false);if(selId){const r=await fetch(`${API_URL}/toggle-visibility/course/${selId}`,{method:'POST'});const d=await r.json();if(d.success)ld()}};
    if(!rd)return<View style={[ss.ct,{backgroundColor:cl.bg}]}><Text style={{color:cl.tx,textAlign:'center',marginTop:100}}>Chargement...</Text></View>;
    const dcs=fc.length>0||st.length>0?fc:cs;
    return(
        <View style={[ss.ct,{backgroundColor:cl.bg}]}>
            <ModalConfirm visible={confirmVis} title={selHidden?'Démasquer ce cours ?':'Masquer ce cours ?'} message={selHidden?'Il sera à nouveau visible.':'Il sera déplacé dans le coffre-fort.'} onCancel={()=>setConfirmVis(false)} onConfirm={doToggleVis} confirmText="Confirmer" confirmColor={selHidden?cl.sc:cl.pr} />
            <ModalConfirm visible={confirmDel} title="Supprimer" message="Mettre ce cours dans la corbeille ?" onCancel={()=>setConfirmDel(false)} onConfirm={doDelete} confirmText="Supprimer" confirmColor={cl.dg} />
            <View style={[ss.hd,{backgroundColor:cl.cd,borderBottomColor:cl.bd}]}>
                <View style={ss.ht}><FontAwesome5 name="book" size={40} color={cl.pr}/><Text style={[ss.hu,{color:cl.tx}]}>{u?gp(u.nom):''}</Text><TouchableOpacity onPress={()=>router.push('/settings')}>{u?.photo?<Image source={{uri:u.photo}} style={ss.pp} contentFit="cover" transition={200} cachePolicy="memory-disk"/>:<View style={ss.pph}><FontAwesome5 name="user" size={22} color="#fff"/></View>}</TouchableOpacity></View>
                <View style={[ss.ha,{borderTopColor:cl.bd}]}>
                    <TouchableOpacity style={[ss.ib,{backgroundColor:cl.ib,borderColor:cl.bd}]} onPress={tt}><FontAwesome5 name={dk?'sun':'moon'} size={18} color={cl.tx}/></TouchableOpacity>
                    <TouchableOpacity style={[ss.ib,{backgroundColor:cl.ib,borderColor:cl.bd}]} onPress={()=>router.push('/settings')}><FontAwesome5 name="cog" size={18} color={cl.tx}/></TouchableOpacity>
                    <TouchableOpacity style={[ss.ib,{backgroundColor:cl.ib,borderColor:cl.bd}]} onPress={()=>router.push('/trash')}><FontAwesome5 name="trash-alt" size={18} color={cl.tx}/></TouchableOpacity>
                    {vaultActive&&<TouchableOpacity style={[ss.ib,{backgroundColor:cl.ib,borderColor:cl.bd}]} onPress={()=>router.push('/vault')}><FontAwesome5 name="lock" size={18} color={cl.tx}/></TouchableOpacity>}
                    <TouchableOpacity style={[ss.ib,{backgroundColor:cl.ib,borderColor:cl.bd}]} onPress={async()=>{await AsyncStorage.removeItem('currentUser');router.replace('/')}}><FontAwesome5 name="sign-out-alt" size={18} color={cl.tx}/></TouchableOpacity>
                </View>
            </View>
            <Text style={[ss.pt,{color:cl.tx}]}>📚 Mes Cours</Text>
            <View style={[ss.sb,{backgroundColor:cl.ib,borderColor:cl.bd}]}><FontAwesome5 name="search" size={16} color={cl.ts} style={{marginRight:8}}/><TextInput style={[ss.si,{color:cl.tx}]} placeholder="Rechercher un cours..." placeholderTextColor={cl.ts} value={st} onChangeText={hs}/>{st.length>0&&<TouchableOpacity onPress={()=>{sst('');sfc([])}}><FontAwesome5 name="times" size={16} color={cl.ts} style={{marginRight:8}}/></TouchableOpacity>}<TouchableOpacity style={[ss.mb,il&&{backgroundColor:'#ef4444'}]} onPress={ts2}><FontAwesome5 name="microphone" size={16} color={il?'#fff':cl.ts}/></TouchableOpacity></View>
            <FlatList data={dcs} renderItem={({item})=>(
                <TouchableOpacity style={[ss.cc,{backgroundColor:cl.cd,borderColor:cl.bd}]} onPress={()=>router.push({pathname:'/course',params:{id:item.id}})}>
                    {item.image_url?<Image source={{uri:item.image_url}} style={ss.ci} contentFit="cover" transition={300} cachePolicy="memory-disk" placeholder={{uri:PH}}/>:<View style={ss.cip}><FontAwesome5 name="book" size={45} color="#fff"/></View>}
                    <View style={ss.cb}><Text style={[ss.ct2,{color:cl.tx}]} numberOfLines={1}>{item.title}</Text><View style={ss.cr}><FontAwesome5 name="user-tie" size={12} color={cl.pr}/><Text style={[ss.cp,{color:cl.ts}]}> {item.professor||'---------'}</Text></View><Text style={[ss.cm,{color:cl.ts}]}>📝 {item.noteCount||0} note(s)</Text><Text style={ss.cd}>📅 {new Date(item.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</Text>
                    <View style={ss.ca}>
                        <TouchableOpacity style={[ss.vis,{backgroundColor:item.hidden?'rgba(239,68,68,0.1)':'rgba(99,102,241,0.1)',borderColor:item.hidden?'rgba(239,68,68,0.3)':'rgba(99,102,241,0.3)'}]} onPress={()=>toggleVis(item.id)}><FontAwesome5 name={item.hidden?'lock':'shield-alt'} size={12} color={item.hidden?cl.dg:cl.pr}/></TouchableOpacity>
                        <TouchableOpacity style={ss.be} onPress={()=>router.push({pathname:'/course',params:{id:item.id}})}><FontAwesome5 name="eye" size={14} color="#fff"/><Text style={ss.bt}> Voir</Text></TouchableOpacity>
                        <TouchableOpacity style={ss.bed} onPress={()=>router.push({pathname:'/edit_course',params:{id:item.id}})}><FontAwesome5 name="edit" size={16} color={cl.wn}/></TouchableOpacity>
                        <TouchableOpacity style={ss.bdl} onPress={()=>dc(item.id)}><FontAwesome5 name="trash-alt" size={16} color={cl.dg}/></TouchableOpacity>
                    </View></View>
                </TouchableOpacity>
            )} keyExtractor={item=>item.id.toString()} contentContainerStyle={ss.ls} ListEmptyComponent={<View style={[ss.es,{backgroundColor:cl.cd,borderColor:cl.bd}]}><FontAwesome5 name="book-open" size={50} color={cl.ts} style={{marginBottom:12}}/><Text style={[ss.et,{color:cl.tx}]}>{st?`Aucun cours pour "${st}"`:'Aucun cours'}</Text><Text style={[ss.etx,{color:cl.ts}]}>{st?"Essayez d'autres mots-clés":'Ajoutez votre premier cours !'}</Text></View>}/>
            <TouchableOpacity style={ss.ab} onPress={()=>router.push('/add_course')}><FontAwesome5 name="plus" size={16} color="#fff"/><Text style={ss.at}> Ajouter un cours</Text></TouchableOpacity>
        </View>
    );
}
const ss=StyleSheet.create({
    ct:{flex:1},hd:{padding:12,paddingTop:50,borderBottomWidth:1},ht:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10},
    hu:{fontSize:18,fontWeight:'700',flex:1,textAlign:'center'},pp:{width:55,height:55,borderRadius:27,borderWidth:2,borderColor:'#6366f1'},pph:{width:55,height:55,borderRadius:27,backgroundColor:'#6366f1',justifyContent:'center',alignItems:'center'},
    ha:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:14,paddingTop:10,borderTopWidth:1},ib:{width:42,height:42,borderRadius:21,justifyContent:'center',alignItems:'center',borderWidth:1},
    pt:{fontSize:20,fontWeight:'700',padding:16,paddingBottom:4},sb:{flexDirection:'row',alignItems:'center',marginHorizontal:12,marginTop:8,marginBottom:4,paddingHorizontal:14,borderRadius:50,borderWidth:1,height:46},
    si:{flex:1,fontSize:14,paddingVertical:0},mb:{marginLeft:4,width:34,height:34,borderRadius:17,justifyContent:'center',alignItems:'center'},ls:{padding:12,paddingTop:8},
    cc:{borderRadius:20,marginBottom:14,overflow:'hidden',borderWidth:1},ci:{width:'100%',height:160},cip:{width:'100%',height:160,backgroundColor:'#6366f1',justifyContent:'center',alignItems:'center'},
    cb:{padding:16},ct2:{fontSize:18,fontWeight:'700',textAlign:'center',marginBottom:8},cr:{flexDirection:'row',alignItems:'center',marginBottom:4},cp:{fontSize:13},
    cm:{fontSize:12,marginBottom:2},cd:{fontSize:11,color:'#64748b',marginBottom:14},ca:{flexDirection:'row',gap:6},
    vis:{width:34,height:34,borderRadius:17,justifyContent:'center',alignItems:'center',borderWidth:1},
    be:{flex:1,backgroundColor:'#6366f1',borderRadius:50,padding:10,alignItems:'center',flexDirection:'row',justifyContent:'center'},bt:{color:'#fff',fontWeight:'600',fontSize:13},
    bed:{backgroundColor:'rgba(245,158,11,0.15)',borderRadius:50,padding:10,paddingHorizontal:14,borderWidth:1,borderColor:'rgba(245,158,11,0.3)'},bdl:{backgroundColor:'rgba(239,68,68,0.1)',borderRadius:50,padding:10,paddingHorizontal:14,borderWidth:1,borderColor:'rgba(239,68,68,0.2)'},
    es:{alignItems:'center',padding:50,borderRadius:20,borderWidth:1,marginHorizontal:12},et:{fontSize:18,fontWeight:'700',marginBottom:6},etx:{fontSize:13},
    ab:{backgroundColor:'#6366f1',margin:14,padding:14,borderRadius:50,alignItems:'center',flexDirection:'row',justifyContent:'center'},at:{color:'#fff',fontSize:15,fontWeight:'700'},
});