// ==========================================
// course.tsx - GeNot Mobile
// ==========================================
import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput, Modal, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
import ModalConfirm from '../components/ModalConfirm';

const API_URL='https://jtt.alwaysdata.net/api', CL_URL='https://api.cloudinary.com/v1_1/dfosclwrp/auto/upload', CL_UP='genotApp';

const uploadWithXHR = (uri, folder, publicId) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest(); xhr.open('POST', CL_URL);
    const fd = new FormData(); fd.append('file', { uri, type: 'application/octet-stream', name: 'upload' } as any);
    fd.append('upload_preset', CL_UP); fd.append('resource_type', 'auto');
    if (folder) fd.append('folder', folder); if (publicId) fd.append('public_id', publicId);
    xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText).secure_url || null) } catch(e) { resolve(null) } };
    xhr.onerror = () => reject(new Error('XHR failed')); xhr.send(fd);
});

export default function CourseScreen(){
    const {id}=useLocalSearchParams();
    const [co,sco]=useState(null), [nt,snt]=useState([]), [ct,sct]=useState('supports'), [st2,sst2]=useState('');
    const [av,sav]=useState(false), [at,sat]=useState(''), [pt,spt]=useState(''), [pf,spf]=useState(null);
    const [lt,slt]=useState(''), [lu,slu]=useState('');
    const [nv,snv]=useState(false), [nti,snti]=useState(''), [nco,snco]=useState('');
    const [ev,sev]=useState(false), [eid,seid]=useState(null), [eti,seti]=useState(''), [eco,seco]=useState('');
    const [esv,sesv]=useState(false), [esid,sesid]=useState(null), [esti,sesti]=useState(''), [esdesc,sesdesc]=useState('');
    const [th,sth]=useState('dark'), [msg,smsg]=useState(''), [mty,smty]=useState('');
    const [pdfUrl,spdfUrl]=useState(null), [pdfVisible,spdfVisible]=useState(false);
    const [audioUrl,setAudioUrl]=useState(null), [audioVisible,setAudioVisible]=useState(false), [audioTitle,setAudioTitle]=useState('');
    const [dlProgress,sdlProgress]=useState(0), [dlVisible,sdlVisible]=useState(false), [dlMsg,sdlMsg]=useState('');
    const [vaultActive,svaultActive]=useState(false);
    const [confirmVis,setConfirmVis]=useState(false), [confirmDel,setConfirmDel]=useState(false), [selType,setSelType]=useState(''), [selItemId,setSelItemId]=useState(null), [selHidden,setSelHidden]=useState(false);
    const [readNote,setReadNote]=useState({visible:false,title:'',content:''});
    
    const dk=th==='dark', cl={bg:dk?'#020617':'#f0f2f5', cd:dk?'#0f172a':'#ffffff', tx:dk?'#f1f5f9':'#1a1a2e', ts:dk?'#94a3b8':'#64748b', bd:dk?'rgba(99,102,241,0.2)':'#e2e8f0', ib:dk?'rgba(255,255,255,0.05)':'#f8fafc', pr:'#6366f1', dg:'#ef4444', sc:'#10b981', wn:'#f59e0b', cy:'#06b6d4'};
    
    useFocusEffect(useCallback(()=>{ld()},[id]));
    
    const ld=async()=>{
        try{
            const uu=await AsyncStorage.getItem('currentUser'), ud=uu?JSON.parse(uu):null;
            if(ud){const rv=await fetch(`${API_URL}/vault/verify`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({matricule:ud.matricule,password:'test'})}); svaultActive((await rv.json()).message!=='Coffre-fort non configuré.')}
            const r=await fetch(`${API_URL}/course/${id}`), d=await r.json();
            if(d.success){sco(d.course);snt(d.notes)}
        }catch(e){}
    };
    
    const di=(nid)=>{setSelType('note');setSelItemId(nid);setConfirmDel(true)};
    const doDelete=async()=>{setConfirmDel(false); if(selItemId){await fetch(`${API_URL}/notes/${selItemId}`,{method:'DELETE'});ld()}};
    const sh=async(title,url)=>{try{await Sharing.shareAsync(url||'',{dialogTitle:title})}catch(e){Alert.alert('Info',url||'Lien copié')}};
    const fn=(type)=>nt.filter(n=>n.type===type&&(!st2||(n.title||'').toLowerCase().includes(st2.toLowerCase())||(n.content||'').toLowerCase().includes(st2.toLowerCase())));
    
    const openPdf=(url)=>{
        if(!url) return;
        const googleUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
        spdfUrl(googleUrl); spdfVisible(true);
    };
    
    const playAudio=(item)=>{
        if(!item.file_url) return;
        setAudioTitle(item.title||'Audio');
        setAudioUrl(item.file_url);
        setAudioVisible(true);
    };
    
    const downloadFile=async(url,filename)=>{
        sdlVisible(true); sdlProgress(0); sdlMsg('Téléchargement...');
        try{
            const u=FileSystem.documentDirectory+(filename||'doc.pdf');
            const dr=FileSystem.createDownloadResumable(url,u,{},(p)=>{sdlProgress(Math.round((p.totalBytesWritten/p.totalBytesExpectedToWrite)*100))});
            const r=await dr.downloadAsync();
            if(r?.uri){sdlMsg('Terminé !');setTimeout(()=>{sdlVisible(false);sdlProgress(0);sdlMsg('')},1500);
                if(await Sharing.isAvailableAsync()) await Sharing.shareAsync(r.uri); else Alert.alert('Succès','Fichier téléchargé.')}
        }catch(e){sdlVisible(false);sdlProgress(0);sdlMsg('');Alert.alert('Erreur','Échec du téléchargement.')}
    };
    
    const handlePickDoc=async()=>{try{const r=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/*','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']}); if(!r.canceled&&r.assets?.length>0)spf(r.assets[0])}catch(e){}};
    const handlePickAudio=async()=>{try{const r=await DocumentPicker.getDocumentAsync({type:['audio/*']}); if(!r.canceled&&r.assets?.length>0)spf(r.assets[0])}catch(e){}};
    
    const submitPdf=async()=>{if(!pt.trim()||!pf){smsg('Titre et fichier requis.');smty('error');return}smsg('Upload en cours...');smty('info');try{const url=await uploadWithXHR(pf.uri,'documents',null);if(url){const r=await fetch(`${API_URL}/notes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({course_id:id,title:pt,content:pf.name,file_url:url,type:'support'})});const d=await r.json();if(d.success){sav(false);resetAdd();ld()}else{smsg(d.message);smty('error')}}else{smsg('Erreur upload');smty('error')}}catch(e){smsg('Erreur connexion: '+e.message);smty('error')}};
    const submitLink=async()=>{if(!lt.trim()||!lu.trim()){smsg('Titre et URL requis.');smty('error');return}try{const r=await fetch(`${API_URL}/notes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({course_id:id,title:lt,content:lu,type:'link'})});const d=await r.json();if(d.success){sav(false);resetAdd();ld()}else{smsg(d.message);smty('error')}}catch(e){smsg('Erreur.');smty('error')}};
    const submitAudio=async()=>{if(!pt.trim()||!pf){smsg('Titre et fichier requis.');smty('error');return}smsg('Upload en cours...');smty('info');try{const url=await uploadWithXHR(pf.uri,'audios',null);if(url){const r=await fetch(`${API_URL}/notes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({course_id:id,title:pt,content:pf.name,file_url:url,type:'audio'})});const d=await r.json();if(d.success){sav(false);resetAdd();ld()}else{smsg(d.message);smty('error')}}else{smsg('Erreur upload');smty('error')}}catch(e){smsg('Erreur connexion: '+e.message);smty('error')}};
    const saveNote=async()=>{if(!nti.trim()||!nco.trim()){Alert.alert('Erreur','Titre et contenu requis.');return}try{const r=await fetch(`${API_URL}/notes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({course_id:id,title:nti,content:nco,type:'note'})});const d=await r.json();if(d.success){snv(false);snti('');snco('');sav(false);resetAdd();ld()}else Alert.alert('Erreur',d.message)}catch(e){Alert.alert('Erreur','Impossible de sauvegarder.')}};
    const openEditNote=(note)=>{seid(note.id);seti(note.title);seco(note.content||'');sev(true)};
    const openEditSupport=(item)=>{sesid(item.id);sesti(item.title);sesdesc(item.content||'');sesv(true)};
    const saveEditedNote=async()=>{if(!eti.trim()||!eco.trim()){Alert.alert('Erreur','Titre et contenu requis.');return}try{const r=await fetch(`${API_URL}/notes/${eid}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:eti,content:eco})});const d=await r.json();if(d.success){sev(false);ld()}else Alert.alert('Erreur',d.message)}catch(e){Alert.alert('Erreur','Impossible de modifier.')}};
    const saveEditedSupport=async()=>{if(!esti.trim()){Alert.alert('Erreur','Titre requis.');return}try{const r=await fetch(`${API_URL}/notes/${esid}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:esti,content:esdesc})});const d=await r.json();if(d.success){sesv(false);ld()}else Alert.alert('Erreur',d.message)}catch(e){Alert.alert('Erreur','Impossible de modifier.')}};
    const toggleVis=(type,item)=>{if(!vaultActive){Alert.alert('Info','Configurez d\'abord le coffre-fort dans les paramètres.');return}setSelType(type);setSelItemId(item.id);setSelHidden(item?.hidden||false);setConfirmVis(true)};
    const doToggleVis=async()=>{setConfirmVis(false);if(selItemId){const r=await fetch(`${API_URL}/toggle-visibility/${selType}/${selItemId}`,{method:'POST'});if((await r.json()).success)ld()}};
    const resetAdd=()=>{sat('');spt('');spf(null);slt('');slu('');smsg('');smty('')};
    
    if(!co) return <View style={[ss.ct,{backgroundColor:cl.bg}]}><Text style={{color:cl.tx,textAlign:'center',marginTop:100}}>Chargement...</Text></View>;
    
    const tabs=[
        {key:'supports',label:'📄 Supports',data:fn('support'),render:({item})=>(<View style={[ss.ic,{backgroundColor:cl.cd,borderColor:cl.bd}]}><TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',gap:10}} onPress={()=>item.file_url?openPdf(item.file_url):null}><View style={[ss.ii2,{backgroundColor:'rgba(239,68,68,0.1)'}]}><FontAwesome5 name="file-pdf" size={18} color={cl.dg}/></View><View style={ss.if}><Text style={[ss.it,{color:cl.tx}]} numberOfLines={1}>{item.title}</Text><Text style={[ss.is,{color:cl.ts}]} numberOfLines={1}>{item.content||'Document'}</Text></View></TouchableOpacity><View style={ss.ia}><TouchableOpacity onPress={()=>toggleVis('note',item)} style={ss.ibn}><FontAwesome5 name={item.hidden?'lock':'shield-alt'} size={16} color={item.hidden?cl.dg:cl.pr}/></TouchableOpacity><TouchableOpacity onPress={()=>openEditSupport(item)} style={ss.ibn}><FontAwesome5 name="edit" size={16} color={cl.wn}/></TouchableOpacity><TouchableOpacity onPress={()=>di(item.id)} style={ss.ibn}><FontAwesome5 name="trash-alt" size={16} color={cl.ts}/></TouchableOpacity>{item.file_url?<TouchableOpacity onPress={()=>downloadFile(item.file_url,item.title+'.pdf')} style={ss.ibn}><FontAwesome5 name="download" size={16} color={cl.sc}/></TouchableOpacity>:null}</View></View>)},
        {key:'links',label:'🔗 Liens',data:fn('link'),render:({item})=>(<View style={[ss.ic,{backgroundColor:cl.cd,borderColor:cl.bd}]}><View style={{flex:1,flexDirection:'row',alignItems:'center',gap:10}}><View style={[ss.ii2,{backgroundColor:'rgba(6,182,212,0.1)'}]}><FontAwesome5 name="link" size={18} color={cl.cy}/></View><View style={ss.if}><Text style={[ss.it,{color:cl.tx}]} numberOfLines={1}>{item.title}</Text><Text style={[ss.is,{color:cl.pr}]} numberOfLines={1}>{item.content||'#'}</Text></View></View><View style={ss.ia}><TouchableOpacity onPress={()=>toggleVis('note',item)} style={ss.ibn}><FontAwesome5 name={item.hidden?'lock':'shield-alt'} size={16} color={item.hidden?cl.dg:cl.pr}/></TouchableOpacity><TouchableOpacity onPress={()=>di(item.id)} style={ss.ibn}><FontAwesome5 name="trash-alt" size={16} color={cl.ts}/></TouchableOpacity><TouchableOpacity onPress={()=>Linking.openURL(item.content.startsWith('http')?item.content:'https://'+item.content)} style={ss.ibn}><FontAwesome5 name="external-link-alt" size={16} color={cl.sc}/></TouchableOpacity></View></View>)},
        {key:'notes',label:'📝 Notes',data:fn('note'),render:({item})=>(<View style={[ss.ic,{backgroundColor:cl.cd,borderColor:cl.bd,borderLeftWidth:3,borderLeftColor:cl.pr}]}><View style={{flex:1,flexDirection:'row',alignItems:'center',gap:10}}><View style={[ss.ii2,{backgroundColor:'rgba(16,185,129,0.1)'}]}><FontAwesome5 name="sticky-note" size={18} color={cl.sc}/></View><View style={ss.if}><Text style={[ss.it,{color:cl.tx}]} numberOfLines={1}>{item.title}</Text><Text style={[ss.is,{color:cl.ts}]} numberOfLines={2}>{item.content?.replace(/<[^>]*>/g,'').substring(0,80)||'Note vide'}</Text></View></View><View style={ss.ia}><TouchableOpacity onPress={()=>toggleVis('note',item)} style={ss.ibn}><FontAwesome5 name={item.hidden?'lock':'shield-alt'} size={16} color={item.hidden?cl.dg:cl.pr}/></TouchableOpacity><TouchableOpacity onPress={()=>openEditNote(item)} style={ss.ibn}><FontAwesome5 name="edit" size={16} color={cl.wn}/></TouchableOpacity><TouchableOpacity onPress={()=>di(item.id)} style={ss.ibn}><FontAwesome5 name="trash-alt" size={16} color={cl.ts}/></TouchableOpacity><TouchableOpacity onPress={()=>{setReadNote({visible:true,title:item.title,content:item.content?.replace(/<[^>]*>/g,'')||''})}} style={ss.ibn}><FontAwesome5 name="eye" size={16} color={cl.ts}/></TouchableOpacity></View></View>)},
        {key:'audios',label:'🎙️ Audios',data:fn('audio'),render:({item})=>(<View style={[ss.ic,{backgroundColor:cl.cd,borderColor:cl.bd}]}><View style={{flex:1,flexDirection:'row',alignItems:'center',gap:10}}><View style={[ss.ii2,{backgroundColor:'rgba(168,85,247,0.1)'}]}><FontAwesome5 name="microphone" size={18} color="#a855f7"/></View><View style={ss.if}><Text style={[ss.it,{color:cl.tx}]} numberOfLines={1}>{item.title}</Text><Text style={[ss.is,{color:cl.ts}]} numberOfLines={1}>{item.content||'Audio'}</Text></View></View><View style={ss.ia}><TouchableOpacity onPress={()=>toggleVis('note',item)} style={ss.ibn}><FontAwesome5 name={item.hidden?'lock':'shield-alt'} size={16} color={item.hidden?cl.dg:cl.pr}/></TouchableOpacity><TouchableOpacity onPress={()=>di(item.id)} style={ss.ibn}><FontAwesome5 name="trash-alt" size={16} color={cl.ts}/></TouchableOpacity>{item.file_url?<><TouchableOpacity onPress={()=>playAudio(item)} style={ss.ibn}><FontAwesome5 name="play" size={16} color={cl.pr}/></TouchableOpacity><TouchableOpacity onPress={()=>downloadFile(item.file_url,item.title+'.mp3')} style={ss.ibn}><FontAwesome5 name="download" size={16} color={cl.sc}/></TouchableOpacity></>:null}</View></View>)}
    ];
    
    const ac=tabs.find(t=>t.key===ct)||tabs[0];
    
    return(<View style={[ss.ct,{backgroundColor:cl.bg}]}>
        <ModalConfirm visible={confirmVis} title={selHidden?'Démasquer cet élément ?':'Masquer cet élément ?'} message={selHidden?'Il sera à nouveau visible.':'Il sera déplacé dans le coffre-fort.'} onCancel={()=>setConfirmVis(false)} onConfirm={doToggleVis} confirmText="Confirmer" confirmColor={selHidden?cl.sc:cl.pr}/>
        <ModalConfirm visible={confirmDel} title="Supprimer" message="Mettre dans la corbeille ?" onCancel={()=>setConfirmDel(false)} onConfirm={doDelete} confirmText="Supprimer" confirmColor={cl.dg}/>
        <Modal visible={readNote.visible} transparent animationType="fade"><View style={ss.mo}><View style={[ss.mc,{backgroundColor:cl.cd,borderColor:cl.bd,padding:0}]}><View style={[ss.mh,{borderBottomColor:cl.bd}]}><Text style={[ss.mt2,{color:cl.tx,flex:1}]} numberOfLines={2}>{readNote.title}</Text><TouchableOpacity onPress={()=>setReadNote({visible:false,title:'',content:''})}><FontAwesome5 name="times" size={18} color={cl.ts}/></TouchableOpacity></View><ScrollView style={{padding:16,maxHeight:400}}><Text style={{color:cl.tx,fontSize:15,lineHeight:24}}>{readNote.content}</Text></ScrollView></View></View></Modal>
        
        <View style={[ss.hd,{backgroundColor:cl.cd,borderBottomColor:cl.bd}]}><TouchableOpacity onPress={()=>router.back()} style={ss.hb}><FontAwesome5 name="arrow-left" size={18} color={cl.pr}/></TouchableOpacity><View style={{flex:1,marginHorizontal:8}}><Text style={[ss.ht,{color:cl.tx}]} numberOfLines={1}>{co.title}</Text><Text style={[ss.hm,{color:cl.ts}]}>{nt.length} élément(s)</Text></View><TouchableOpacity onPress={()=>sav(true)} style={[ss.hb,{backgroundColor:cl.pr,borderRadius:20,width:36,height:36}]}><FontAwesome5 name="plus" size={14} color="#fff"/></TouchableOpacity></View>
        
        <View style={[ss.sb2,{backgroundColor:cl.ib,borderColor:cl.bd}]}><FontAwesome5 name="search" size={14} color={cl.ts} style={{marginRight:8}}/><TextInput style={[ss.si,{color:cl.tx}]} placeholder={ct==='supports'?'🔍 Titre...':ct==='links'?'🔍 Titre ou URL...':ct==='notes'?'🔍 Titre ou contenu...':'🔍 Titre audio...'} placeholderTextColor={cl.ts} value={st2} onChangeText={sst2}/>{st2.length>0&&<TouchableOpacity onPress={()=>sst2('')}><FontAwesome5 name="times" size={14} color={cl.ts} style={{marginLeft:8}}/></TouchableOpacity>}</View>
        
        <View style={ss.tb}>{tabs.map(t=>(<TouchableOpacity key={t.key} style={[ss.ti,ct===t.key&&{backgroundColor:cl.pr+'20'}]} onPress={()=>sct(t.key)}><Text style={[ss.tt,{color:ct===t.key?cl.pr:cl.ts}]}>{t.label}</Text></TouchableOpacity>))}</View>
        
        <FlatList data={ac.data} renderItem={ac.render} keyExtractor={item=>item.id.toString()} contentContainerStyle={ss.ls} ListEmptyComponent={<View style={[ss.em2,{backgroundColor:cl.cd,borderColor:cl.bd}]}><FontAwesome5 name="folder-open" size={50} color={cl.ts} style={{marginBottom:12}}/><Text style={{color:cl.ts,fontSize:14}}>Aucun élément</Text></View>}/>
        
        {/* Modal PDF */}
        <Modal visible={pdfVisible} transparent animationType="slide" onRequestClose={()=>{spdfVisible(false);spdfUrl(null)}}>
            <View style={[ss.pdfContainer,{backgroundColor:cl.bg}]}>
                <View style={[ss.pdfHeader,{borderBottomColor:cl.bd}]}>
                    <TouchableOpacity onPress={()=>{spdfVisible(false);spdfUrl(null)}}><FontAwesome5 name="times" size={20} color={cl.ts}/></TouchableOpacity>
                    <Text style={{color:cl.tx,fontWeight:'600',fontSize:14,flex:1,textAlign:'center'}} numberOfLines={1}>Lecteur PDF</Text>
                    <TouchableOpacity onPress={()=>{if(pdfUrl) Alert.alert('Télécharger','Voulez-vous télécharger ce document ?',[{text:'Annuler',style:'cancel'},{text:'Télécharger',onPress:()=>downloadFile(pdfUrl,'document.pdf')}]);}}><FontAwesome5 name="download" size={18} color={cl.pr}/></TouchableOpacity>
                </View>
                {pdfUrl ? <WebView source={{uri:pdfUrl}} style={{flex:1}} originWhitelist={['*']} javaScriptEnabled={true} domStorageEnabled={true} startInLoadingState={true} renderLoading={()=><View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator size="large" color={cl.pr}/><Text style={{color:cl.tx,marginTop:10}}>Chargement du PDF...</Text></View>}/> : <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{color:cl.tx}}>Aucun document à afficher</Text></View>}
            </View>
        </Modal>
        
        {/* Modal Audio */}
        <Modal visible={audioVisible} transparent animationType="slide" onRequestClose={()=>{setAudioVisible(false);setAudioUrl(null)}}>
            <View style={[ss.pdfContainer,{backgroundColor:cl.bg}]}>
                <View style={[ss.pdfHeader,{borderBottomColor:cl.bd}]}>
                    <TouchableOpacity onPress={()=>{setAudioVisible(false);setAudioUrl(null)}}>
                        <FontAwesome5 name="times" size={20} color={cl.ts}/>
                    </TouchableOpacity>
                    <Text style={{color:cl.tx,fontWeight:'600',fontSize:14,flex:1,textAlign:'center'}} numberOfLines={1}>
                        🎙️ {audioTitle||'Lecteur Audio'}
                    </Text>
                    <TouchableOpacity onPress={()=>{if(audioUrl) downloadFile(audioUrl,(audioTitle||'audio')+'.mp3')}}>
                        <FontAwesome5 name="download" size={18} color={cl.pr}/>
                    </TouchableOpacity>
                </View>
                {audioUrl ? (
                    <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:20}}>
                        <View style={{flexDirection:'row',alignItems:'flex-end',gap:6,height:80,marginBottom:30}}>
                            {[0.6,0.3,0.8,0.5,1,0.4,0.7,0.2,0.9,0.5,0.6,0.3,0.8,0.4,0.7,0.6].map((h,i)=>(
                                <View key={i} style={{width:6,height:60*h,backgroundColor:cl.pr,borderRadius:3,opacity:0.4+h*0.6}}/>
                            ))}
                        </View>
                        <Text style={{color:cl.tx,fontSize:20,fontWeight:'700',textAlign:'center',marginBottom:8}} numberOfLines={1}>{audioTitle}</Text>
                        <Text style={{color:cl.ts,fontSize:13,marginBottom:40}}>Audio en cours de lecture</Text>
                        <View style={{width:'100%',borderRadius:16,overflow:'hidden',backgroundColor:cl.cd+'80',borderWidth:1,borderColor:cl.bd}}>
                            <WebView 
                                source={{html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;justify-content:center;align-items:center;min-height:80px;background:transparent;font-family:-apple-system,sans-serif}audio{width:100%;outline:none;filter:sepia(20%) saturate(70%) hue-rotate(220deg)}audio::-webkit-media-controls-panel{background:rgba(15,23,42,0.5)}audio::-webkit-media-controls-play-button{background:#6366f1;border-radius:50%}audio::-webkit-media-controls-current-time-display,audio::-webkit-media-controls-time-remaining-display{color:#f1f5f9}audio::-webkit-media-controls-timeline{background:rgba(99,102,241,0.2);border-radius:10px}</style></head><body><audio controls autoplay><source src="${audioUrl}" type="audio/mpeg"></audio></body></html>`}}
                                style={{width:'100%',height:60}}
                                originWhitelist={['*']}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                mediaPlaybackRequiresUserAction={false}
                                scrollEnabled={false}
                            />
                        </View>
                    </View>
                ) : (
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <FontAwesome5 name="headphones" size={60} color={cl.ts}/>
                        <Text style={{color:cl.ts,marginTop:16,fontSize:16}}>Aucun audio à lire</Text>
                    </View>
                )}
            </View>
        </Modal>
        
        <Modal visible={dlVisible} transparent animationType="fade"><View style={ss.dlOverlay}><View style={[ss.dlCard,{backgroundColor:cl.cd,borderColor:cl.bd}]}><Text style={{color:cl.tx,fontWeight:'700',fontSize:16,marginBottom:12}}>📥 {dlMsg}</Text><View style={[ss.dlBar,{backgroundColor:cl.bd}]}><View style={[ss.dlFill,{width:dlProgress+'%',backgroundColor:cl.pr}]}/></View><Text style={{color:cl.ts,fontSize:13,marginTop:8}}>{dlProgress}%</Text></View></View></Modal>
        
        {/* Modal Ajout */}
        <Modal visible={av} transparent animationType="fade"><View style={ss.mo}><View style={[ss.mc,{backgroundColor:cl.cd,borderColor:cl.bd}]}><View style={[ss.mh,{borderBottomColor:cl.bd}]}><Text style={[ss.mt2,{color:cl.tx}]}>Ajouter un élément</Text><TouchableOpacity onPress={()=>{sav(false);resetAdd()}}><FontAwesome5 name="times" size={16} color={cl.ts}/></TouchableOpacity></View><View style={[ss.mb2,{borderBottomColor:cl.bd}]}>{['pdf','link','note','audio'].map(tp=>(<TouchableOpacity key={tp} style={[ss.tb2,at===tp&&{backgroundColor:cl.pr+'30',borderColor:cl.pr}]} onPress={()=>{sat(tp);smsg('')}}><FontAwesome5 name={tp==='pdf'?'file-pdf':tp==='link'?'link':tp==='note'?'sticky-note':'microphone'} size={20} color={at===tp?cl.pr:cl.ts}/><Text style={{color:at===tp?cl.pr:cl.ts,fontSize:12,marginTop:4,fontWeight:'600'}}>{tp==='pdf'?'PDF':tp==='link'?'Lien':tp==='note'?'Note':'Audio'}</Text></TouchableOpacity>))}</View>
        {at==='pdf'&&<View style={{padding:16}}><Text style={[ss.lb,{color:cl.tx}]}>Titre <Text style={{color:cl.dg}}>*</Text></Text><TextInput style={[ss.in,{backgroundColor:cl.ib,borderColor:cl.bd,color:cl.tx}]} placeholder="Titre du document" placeholderTextColor={cl.ts} value={pt} onChangeText={spt}/><Text style={[ss.lb,{color:cl.tx,marginTop:12}]}>Fichier <Text style={{color:cl.dg}}>*</Text></Text><TouchableOpacity style={[ss.fb,{backgroundColor:cl.ib,borderColor:cl.bd}]} onPress={handlePickDoc}><FontAwesome5 name="upload" size={14} color={cl.ts}/><Text style={{color:cl.ts,marginLeft:8,fontSize:13}}>{pf?pf.name:'Choisir un fichier'}</Text></TouchableOpacity>{msg?<View style={[ss.msg,mty==='error'?{backgroundColor:'rgba(239,68,68,0.1)',borderColor:'rgba(239,68,68,0.2)'}:{backgroundColor:'rgba(99,102,241,0.1)',borderColor:'rgba(99,102,241,0.2)'}]}><Text style={{color:mty==='error'?cl.dg:cl.pr,fontSize:12,textAlign:'center'}}>{msg}</Text></View>:null}<TouchableOpacity style={[ss.bn,{backgroundColor:cl.pr}]} onPress={submitPdf}><Text style={{color:'#fff',textAlign:'center',fontWeight:'600'}}>Ajouter</Text></TouchableOpacity></View>}
        {at==='link'&&<View style={{padding:16}}><Text style={[ss.lb,{color:cl.tx}]}>Titre <Text style={{color:cl.dg}}>*</Text></Text><TextInput style={[ss.in,{backgroundColor:cl.ib,borderColor:cl.bd,color:cl.tx}]} placeholder="Nom du lien" placeholderTextColor={cl.ts} value={lt} onChangeText={slt}/><Text style={[ss.lb,{color:cl.tx,marginTop:12}]}>URL <Text style={{color:cl.dg}}>*</Text></Text><TextInput style={[ss.in,{backgroundColor:cl.ib,borderColor:cl.bd,color:cl.tx}]} placeholder="https://..." placeholderTextColor={cl.ts} value={lu} onChangeText={slu} keyboardType="url" autoCapitalize="none"/>{msg?<View style={[ss.msg,mty==='error'?{backgroundColor:'rgba(239,68,68,0.1)',borderColor:'rgba(239,68,68,0.2)'}:{backgroundColor:'rgba(99,102,241,0.1)',borderColor:'rgba(99,102,241,0.2)'}]}><Text style={{color:mty==='error'?cl.dg:cl.pr,fontSize:12,textAlign:'center'}}>{msg}</Text></View>:null}<TouchableOpacity style={[ss.bn,{backgroundColor:cl.pr}]} onPress={submitLink}><Text style={{color:'#fff',textAlign:'center',fontWeight:'600'}}>Ajouter</Text></TouchableOpacity></View>}
        {at==='note'&&<View style={{padding:16,alignItems:'center'}}><TouchableOpacity style={[ss.bn,{backgroundColor:cl.pr,width:'100%',padding:20}]} onPress={()=>{sav(false);snv(true)}}><FontAwesome5 name="pen" size={24} color="#fff"/><Text style={{color:'#fff',fontSize:16,fontWeight:'700',marginTop:8}}>Ouvrir le cahier</Text></TouchableOpacity></View>}
        {at==='audio'&&<View style={{padding:16}}><Text style={[ss.lb,{color:cl.tx}]}>Titre <Text style={{color:cl.dg}}>*</Text></Text><TextInput style={[ss.in,{backgroundColor:cl.ib,borderColor:cl.bd,color:cl.tx}]} placeholder="Titre de l'audio" placeholderTextColor={cl.ts} value={pt} onChangeText={spt}/><Text style={[ss.lb,{color:cl.tx,marginTop:12}]}>Fichier audio <Text style={{color:cl.dg}}>*</Text></Text><TouchableOpacity style={[ss.fb,{backgroundColor:cl.ib,borderColor:cl.bd}]} onPress={handlePickAudio}><FontAwesome5 name="upload" size={14} color={cl.ts}/><Text style={{color:cl.ts,marginLeft:8,fontSize:13}}>{pf?pf.name:'Choisir un fichier audio'}</Text></TouchableOpacity>{msg?<View style={[ss.msg,mty==='error'?{backgroundColor:'rgba(239,68,68,0.1)',borderColor:'rgba(239,68,68,0.2)'}:{backgroundColor:'rgba(99,102,241,0.1)',borderColor:'rgba(99,102,241,0.2)'}]}><Text style={{color:mty==='error'?cl.dg:cl.pr,fontSize:12,textAlign:'center'}}>{msg}</Text></View>:null}<TouchableOpacity style={[ss.bn,{backgroundColor:cl.pr}]} onPress={submitAudio}><Text style={{color:'#fff',textAlign:'center',fontWeight:'600'}}>Ajouter</Text></TouchableOpacity></View>}
        <TouchableOpacity style={{padding:12}} onPress={()=>{sav(false);resetAdd()}}><Text style={{color:cl.ts,textAlign:'center',fontSize:13}}>Annuler</Text></TouchableOpacity></View></View></Modal>
        
        <Modal visible={nv} transparent animationType="slide"><View style={[ss.nc,{backgroundColor:cl.cd}]}><View style={[ss.nh,{borderBottomColor:cl.bd}]}><TouchableOpacity onPress={()=>{snv(false);snti('');snco('')}}><Text style={{color:cl.dg,fontWeight:'600'}}>Annuler</Text></TouchableOpacity><Text style={{color:cl.tx,fontWeight:'700',fontSize:15}}>📝 Nouvelle note</Text><TouchableOpacity onPress={saveNote}><Text style={{color:cl.pr,fontWeight:'700'}}>Enregistrer</Text></TouchableOpacity></View><ScrollView style={{flex:1,padding:16}}><TextInput style={[ss.nti2,{color:cl.tx,borderBottomColor:cl.bd}]} placeholder="Titre de la note..." placeholderTextColor={cl.ts} value={nti} onChangeText={snti}/><TextInput style={[ss.nci,{color:cl.tx}]} placeholder="Commencez à écrire..." placeholderTextColor={cl.ts} value={nco} onChangeText={snco} multiline textAlignVertical="top"/></ScrollView></View></Modal>
        
        <Modal visible={ev} transparent animationType="slide"><View style={[ss.nc,{backgroundColor:cl.cd}]}><View style={[ss.nh,{borderBottomColor:cl.bd}]}><TouchableOpacity onPress={()=>sev(false)}><Text style={{color:cl.dg,fontWeight:'600'}}>Annuler</Text></TouchableOpacity><Text style={{color:cl.tx,fontWeight:'700',fontSize:15}}>✏️ Modifier la note</Text><TouchableOpacity onPress={saveEditedNote}><Text style={{color:cl.pr,fontWeight:'700'}}>Enregistrer</Text></TouchableOpacity></View><ScrollView style={{flex:1,padding:16}}><TextInput style={[ss.nti2,{color:cl.tx,borderBottomColor:cl.bd}]} placeholder="Titre" placeholderTextColor={cl.ts} value={eti} onChangeText={seti}/><TextInput style={[ss.nci,{color:cl.tx}]} placeholder="Contenu..." placeholderTextColor={cl.ts} value={eco} onChangeText={seco} multiline textAlignVertical="top"/></ScrollView></View></Modal>
        
        <Modal visible={esv} transparent animationType="slide"><View style={[ss.nc,{backgroundColor:cl.cd}]}><View style={[ss.nh,{borderBottomColor:cl.bd}]}><TouchableOpacity onPress={()=>sesv(false)}><Text style={{color:cl.dg,fontWeight:'600'}}>Annuler</Text></TouchableOpacity><Text style={{color:cl.tx,fontWeight:'700',fontSize:15}}>✏️ Modifier le document</Text><TouchableOpacity onPress={saveEditedSupport}><Text style={{color:cl.pr,fontWeight:'700'}}>Enregistrer</Text></TouchableOpacity></View><ScrollView style={{flex:1,padding:16}}><Text style={[ss.lb,{color:cl.tx,marginBottom:6}]}>Titre</Text><TextInput style={[ss.in,{backgroundColor:cl.ib,borderColor:cl.bd,color:cl.tx}]} value={esti} onChangeText={sesti}/><Text style={[ss.lb,{color:cl.tx,marginTop:12,marginBottom:6}]}>Description</Text><TextInput style={[ss.in,{backgroundColor:cl.ib,borderColor:cl.bd,color:cl.tx}]} value={esdesc} onChangeText={sesdesc} multiline/></ScrollView></View></Modal>
    </View>);
}

const ss=StyleSheet.create({
    ct:{flex:1}, hd:{flexDirection:'row',alignItems:'center',padding:12,paddingTop:48,borderBottomWidth:1,gap:8}, hb:{width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center'},
    ht:{fontSize:16,fontWeight:'700'}, hm:{fontSize:11,marginTop:2},
    sb2:{flexDirection:'row',alignItems:'center',margin:12,paddingHorizontal:12,borderRadius:25,borderWidth:1,height:40}, si:{flex:1,fontSize:13},
    tb:{flexDirection:'row',paddingHorizontal:12,gap:4,marginBottom:4}, ti:{flex:1,paddingVertical:8,borderRadius:20,alignItems:'center'}, tt:{fontSize:12,fontWeight:'600'},
    ls:{padding:12,paddingTop:4}, ic:{flexDirection:'row',alignItems:'center',gap:10,padding:12,borderRadius:14,marginBottom:10,borderWidth:1,flexWrap:'wrap'},
    ii2:{width:42,height:42,borderRadius:10,justifyContent:'center',alignItems:'center'}, if:{flex:1,minWidth:150}, it:{fontSize:13,fontWeight:'600'}, is:{fontSize:11,marginTop:2},
    ia:{flexDirection:'row',gap:8,justifyContent:'flex-end',width:'100%',paddingTop:8,borderTopWidth:1,borderTopColor:'rgba(255,255,255,0.1)'},
    ibn:{padding:8,width:38,height:38,borderRadius:10,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)'},
    em2:{alignItems:'center',padding:50,borderRadius:16,borderWidth:1},
    pdfContainer:{flex:1}, pdfHeader:{flexDirection:'row',alignItems:'center',padding:14,paddingTop:48,borderBottomWidth:1,gap:12},
    dlOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'center',alignItems:'center',padding:30}, dlCard:{width:'80%',borderRadius:16,padding:24,borderWidth:1}, dlBar:{height:8,borderRadius:4,overflow:'hidden'}, dlFill:{height:'100%',borderRadius:4},
    mo:{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'center',padding:20}, mc:{borderRadius:20,borderWidth:1,maxHeight:'80%'},
    mh:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1}, mt2:{fontSize:16,fontWeight:'700'},
    mb2:{flexDirection:'row',padding:12,gap:8,borderBottomWidth:1}, tb2:{flex:1,paddingVertical:12,borderRadius:12,alignItems:'center',borderWidth:2,borderColor:'transparent'},
    lb:{fontSize:12,fontWeight:'600',marginBottom:6}, in:{borderWidth:1,borderRadius:10,padding:10,fontSize:13,marginBottom:4},
    fb:{flexDirection:'row',alignItems:'center',borderWidth:1,borderRadius:10,padding:12}, msg:{padding:10,borderRadius:8,marginTop:8,borderWidth:1},
    bn:{padding:14,borderRadius:12,marginTop:8},
    nc:{flex:1}, nh:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,paddingTop:48,borderBottomWidth:1},
    nti2:{fontSize:18,fontWeight:'700',paddingVertical:10,borderBottomWidth:2,marginBottom:16}, nci:{flex:1,fontSize:15,lineHeight:24,minHeight:250},
});