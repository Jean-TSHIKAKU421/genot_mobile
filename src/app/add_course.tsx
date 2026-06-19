// ==========================================
// add_course.tsx
// ==========================================
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const API_URL = 'https://jtt.alwaysdata.net/api';
const CL_URL = 'https://api.cloudinary.com/v1_1/dfosclwrp/image/upload';
const CL_UP = 'genotApp';

export default function AddCourseScreen() {
    const [ti,sti] = useState(''); const [pr,spr] = useState(''); const [de,sde] = useState(''); const [im,sim] = useState(null);
    const [lo,slo] = useState(false); const [mg,smg] = useState(''); const [mt,smt] = useState(''); const [us,sus] = useState(null); const [th,sth] = useState('dark');
    useEffect(()=>{AsyncStorage.getItem('theme').then(t=>{if(t)sth(t)});(async()=>{const u=await AsyncStorage.getItem('currentUser');if(!u){router.replace('/');return}sus(JSON.parse(u))})()},[]);
    const dk=th==='dark';const cl={bg:dk?'#020617':'#f0f2f5',cd:dk?'#0f172a':'#ffffff',tx:dk?'#f1f5f9':'#1a1a2e',ts:dk?'#94a3b8':'#64748b',bd:dk?'rgba(99,102,241,0.2)':'#e2e8f0',ib:dk?'rgba(255,255,255,0.05)':'#f8fafc',pr:'#6366f1',dg:'#ef4444',sc:'#10b981'};
    const pi=async()=>{const{status}=await ImagePicker.requestMediaLibraryPermissionsAsync();if(status!=='granted'){Alert.alert('Permission',"Autorisez l'accès à la galerie.");return}const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,aspect:[16,9],quality:0.8});if(!r.canceled)sim(r.assets[0])};
    const hc=async()=>{
        if(!ti.trim()){smg('Le titre du cours est requis.');smt('error');return}
        slo(true);smg('');
        try{
            let iu=null;
            if(im){const b64=await FileSystem.readAsStringAsync(im.uri,{encoding:FileSystem.EncodingType.Base64});const fd=new FormData();fd.append('file',`data:image/jpeg;base64,${b64}`);fd.append('upload_preset',CL_UP);fd.append('folder','courses');const cr=await fetch(CL_URL,{method:'POST',body:fd});const cd=await cr.json();if(cd.secure_url)iu=cd.secure_url;else{smg('Erreur upload image.');smt('error');slo(false);return}}
            const fd=new FormData();fd.append('title',ti.trim());fd.append('user_matricule',us.matricule);if(pr.trim())fd.append('professor',pr.trim());if(de.trim())fd.append('description',de.trim());if(iu)fd.append('image_url',iu);
            const r=await fetch(`${API_URL}/courses`,{method:'POST',body:fd});const d=await r.json();
            if(d.success){smg('✅ Cours créé !');smt('success');setTimeout(()=>router.back(),800)}else{smg(d.message||'Erreur.');smt('error')}
        }catch(e){smg('Erreur: '+e.message);smt('error')}
        slo(false);
    };
    if(!us)return<View style={[ss.ct,{backgroundColor:cl.bg}]}><Text style={{color:cl.tx,textAlign:'center',marginTop:100}}>Chargement...</Text></View>;
    return(
        <View style={[ss.ct,{backgroundColor:cl.bg}]}>
            <View style={[ss.hd,{backgroundColor:cl.cd,borderBottomColor:cl.bd}]}><TouchableOpacity onPress={()=>router.back()} style={ss.hb}><FontAwesome5 name="arrow-left" size={18} color={cl.pr}/></TouchableOpacity><Text style={[ss.ht,{color:cl.tx}]}>Nouveau cours</Text><View style={ss.hb}/></View>
            <ScrollView contentContainerStyle={ss.cn} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TouchableOpacity onPress={pi} style={[ss.ip,{backgroundColor:cl.ib,borderColor:cl.bd}]} activeOpacity={0.7}>
                    {im?<View style={ss.iv}><Image source={{uri:im.uri}} style={ss.pv}/><TouchableOpacity style={ss.rb} onPress={()=>sim(null)}><FontAwesome5 name="times-circle" size={24} color={cl.dg}/></TouchableOpacity></View>:<View style={ss.ph}><FontAwesome5 name="image" size={40} color={cl.ts}/><Text style={[ss.pt,{color:cl.ts}]}>Ajouter une image de couverture</Text><Text style={[ss.ps,{color:cl.ts}]}>Format 16:9 • Max 5 Mo</Text></View>}
                </TouchableOpacity>
                <View style={[ss.fc,{backgroundColor:cl.cd,borderColor:cl.bd}]}>
                    <View style={ss.fg}><Text style={[ss.lb,{color:cl.tx}]}>Titre du cours <Text style={{color:'#ef4444'}}>*</Text></Text><View style={[ss.iw,{backgroundColor:cl.ib,borderColor:cl.bd}]}><FontAwesome5 name="book" size={14} color={cl.ts} style={ss.ii}/><TextInput style={[ss.in,{color:cl.tx}]} placeholder="Ex: Mathématiques générales" placeholderTextColor={cl.ts} value={ti} onChangeText={sti} maxLength={100}/></View></View>
                    <View style={ss.fg}><Text style={[ss.lb,{color:cl.tx}]}>Professeur <Text style={{color:'#64748b',fontSize:11}}>(optionnel)</Text></Text><View style={[ss.iw,{backgroundColor:cl.ib,borderColor:cl.bd}]}><FontAwesome5 name="user-tie" size={14} color={cl.ts} style={ss.ii}/><TextInput style={[ss.in,{color:cl.tx}]} placeholder="Ex: Dr. Mukendi" placeholderTextColor={cl.ts} value={pr} onChangeText={spr}/></View></View>
                    <View style={ss.fg}><Text style={[ss.lb,{color:cl.tx}]}>Description <Text style={{color:'#64748b',fontSize:11}}>(optionnel)</Text></Text><View style={[ss.tw,{backgroundColor:cl.ib,borderColor:cl.bd}]}><TextInput style={[ss.ta,{color:cl.tx}]} placeholder="Décrivez brièvement ce cours..." placeholderTextColor={cl.ts} value={de} onChangeText={sde} multiline numberOfLines={4} textAlignVertical="top" maxLength={500}/></View><Text style={[ss.cc,{color:cl.ts}]}>{de.length}/500</Text></View>
                </View>
                {mg?<View style={[ss.mb,mt==='error'?ss.me:ss.ms]}><Text style={[ss.mt2,{color:mt==='error'?'#fca5a5':'#6ee7b7'}]}>{mg}</Text></View>:null}
                <TouchableOpacity style={[ss.sb,{backgroundColor:cl.pr}]} onPress={hc} disabled={lo} activeOpacity={0.8}>{lo?<ActivityIndicator color="#fff"/>:<View style={ss.sbc}><FontAwesome5 name="plus-circle" size={16} color="#fff"/><Text style={ss.sbt}> Créer le cours</Text></View>}</TouchableOpacity>
                <TouchableOpacity style={[ss.cb,{borderColor:cl.bd}]} onPress={()=>router.back()}><Text style={[ss.cbt,{color:cl.ts}]}>Annuler</Text></TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const ss=StyleSheet.create({
    ct:{flex:1},hd:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:50,paddingBottom:14,borderBottomWidth:1},hb:{width:40,height:40,justifyContent:'center',alignItems:'center'},ht:{fontSize:18,fontWeight:'700'},
    cn:{padding:16,paddingBottom:40},ip:{height:200,borderRadius:16,borderWidth:2,borderStyle:'dashed',marginBottom:20,overflow:'hidden'},iv:{width:'100%',height:'100%',position:'relative'},pv:{width:'100%',height:'100%',resizeMode:'cover'},
    rb:{position:'absolute',top:10,right:10,backgroundColor:'rgba(0,0,0,0.5)',borderRadius:12,padding:4},ph:{flex:1,justifyContent:'center',alignItems:'center',padding:20},pt:{fontSize:14,fontWeight:'600',marginTop:10},ps:{fontSize:11,marginTop:4},
    fc:{borderRadius:20,padding:20,borderWidth:1,marginBottom:20},fg:{marginBottom:18},lb:{fontSize:13,fontWeight:'600',marginBottom:8},iw:{flexDirection:'row',alignItems:'center',borderWidth:2,borderRadius:12,overflow:'hidden'},ii:{paddingLeft:14,width:36},
    in:{flex:1,paddingVertical:14,paddingRight:14,fontSize:15},tw:{borderWidth:2,borderRadius:12,overflow:'hidden'},ta:{padding:14,fontSize:15,minHeight:100,lineHeight:22},cc:{fontSize:11,textAlign:'right',marginTop:4},
    mb:{padding:14,borderRadius:12,marginBottom:16,borderWidth:1},me:{backgroundColor:'rgba(239,68,68,0.1)',borderColor:'rgba(239,68,68,0.2)'},ms:{backgroundColor:'rgba(16,185,129,0.1)',borderColor:'rgba(16,185,129,0.2)'},mt2:{fontSize:13,textAlign:'center',fontWeight:'500'},
    sb:{borderRadius:50,padding:16,alignItems:'center',shadowColor:'#6366f1',shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:12,elevation:6},sbc:{flexDirection:'row',alignItems:'center',gap:8},sbt:{color:'#fff',fontSize:16,fontWeight:'700'},
    cb:{borderRadius:50,padding:14,alignItems:'center',marginTop:12,borderWidth:1},cbt:{fontSize:14,fontWeight:'600'},
});