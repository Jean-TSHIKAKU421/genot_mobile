// ==========================================
// admin.tsx
// ==========================================
import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, Modal, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { WebView } from 'react-native-webview';
const API_URL = 'https://jtt.alwaysdata.net/api';
export default function AdminScreen() {
    const [st, sst] = useState({ u: 0, c: 0, n: 0, p: 0, l: 0 });
    const [vi, svi] = useState(null); const [md, smd] = useState(null);
    const [sm, ssm] = useState(new Date().getMonth() + 1); const [sy, ssy] = useState(new Date().getFullYear());
    const [shm, sshm] = useState(false); const [shy, sshy] = useState(false); const [yi, syi] = useState('');
    const [sq, ssq] = useState(''); const [sr, ssr] = useState(null); const [se, sse] = useState(''); const [sl, ssl] = useState(false);
    const [at, sat] = useState('dashboard'); const [rd, srd] = useState(false);
    const cl = { bg: '#020617', cd: '#0f172a', tx: '#f1f5f9', ts: '#94a3b8', bd: 'rgba(99,102,241,0.2)', ib: 'rgba(255,255,255,0.05)', pr: '#6366f1', sc: '#10b981', dg: '#ef4444', wn: '#f59e0b' };
    useFocusEffect(useCallback(() => { (async () => { await ls(); await lv(); await lm(sm, sy); srd(true); })(); }, []));
    const ls = async () => { try { const r = await fetch(`${API_URL}/admin/stats`); const d = await r.json(); if (d.success && d.stats) sst({ u: d.stats.users, c: d.stats.courses, n: d.stats.notes, p: d.stats.pdfs, l: d.stats.links }); } catch (e) {} };
    const lv = async () => { try { const r = await fetch(`${API_URL}/admin/visits`); const d = await r.json(); if (d.success) svi(d); } catch (e) {} };
    const lm = async (m, y) => { try { const r = await fetch(`${API_URL}/admin/visits-monthly?month=${m}&year=${y}`); const d = await r.json(); if (d.success) smd(d); } catch (e) {} };
    const es = async () => { if (!sq.trim()) return; ssl(true); sse(''); ssr(null); try { const r = await fetch(`${API_URL}/admin/sql`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: sq }) }); const d = await r.json(); if (d.success) ssr(d); else sse(d.message); } catch (e) { sse('Erreur de connexion.'); } ssl(false); };
    const ch = md && md.data && !md.data.every(x => x.count === 0) ? (() => {
        const raw = md.data; const days = md.daysInMonth;
        const now = new Date(); const cd2 = (now.getFullYear() === sy && now.getMonth() + 1 === sm) ? now.getDate() : days;
        const maxVal = Math.max(...raw.map(r => r.count), 1);
        const stepX = maxVal <= 5 ? 1 : maxVal <= 20 ? Math.ceil(maxVal / 5) : Math.ceil(maxVal / 6);
        const fillVal = maxVal + stepX;
        return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script><script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"><\/script><style>body{background:#0f172a;margin:0;padding:10px;font-family:monospace}canvas{width:100%!important}</style></head><body><canvas id="chart"></canvas><script>const raw=${JSON.stringify(raw)};const days=${days};const cd=${cd2};const labels=[];const values=[];const colors=[];for(let d=1;d<=days;d++){const f=raw.find(r=>r.day===d);labels.push(d);if(d>cd){values.push(${fillVal});colors.push('rgba(16,185,129,0.6)')}else if(f&&f.count>0){values.push(f.count);colors.push('rgba(99,102,241,0.7)')}else{values.push(${fillVal});colors.push('rgba(239,68,68,0.6)')}}document.getElementById('chart').style.height=(days*24+30)+'px';new Chart(document.getElementById('chart'),{type:'bar',data:{labels,datasets:[{data:values,backgroundColor:colors,borderRadius:4,barPercentage:0.65,categoryPercentage:0.8}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'center',align:'center',color:'#fff',font:{size:9,weight:'bold'},formatter:v=>v>0&&v<${fillVal}?v:''}},scales:{x:{beginAtZero:true,max:${fillVal},ticks:{color:'#94a3b8',font:{size:9},stepSize:${stepX}},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#94a3b8',font:{size:10},autoSkip:false},grid:{display:false}}}},plugins:[ChartDataLabels]});<\/script></body></html>`;
    })() : null;
    if (!rd) return <View style={[ss.ct, { backgroundColor: cl.bg }]}><ActivityIndicator color={cl.pr} style={{ marginTop: 100 }} /></View>;
    const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return (
        <View style={[ss.ct, { backgroundColor: cl.bg }]}>
            <View style={[ss.hd, { backgroundColor: cl.cd, borderBottomColor: cl.bd }]}><TouchableOpacity onPress={() => router.replace('/')}><Text style={{ color: cl.pr, fontSize: 16 }}>← Sortir</Text></TouchableOpacity><Text style={[ss.ht, { color: cl.tx }]}>🛡️ Admin Panel</Text><TouchableOpacity onPress={async () => { await ls(); await lv(); await lm(sm, sy); }}><FontAwesome5 name="sync" size={16} color={cl.pr} /></TouchableOpacity></View>
            <View style={ss.tb}>{['dashboard','visits','sql'].map(t => (<TouchableOpacity key={t} style={[ss.ti, at === t && { backgroundColor: cl.pr }]} onPress={() => sat(t)}><Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>{t === 'visits' ? 'Visites' : t === 'sql' ? 'SQL' : 'Dashboard'}</Text></TouchableOpacity>))}</View>
            {at === 'dashboard' && (
                <ScrollView contentContainerStyle={ss.cn}>
                    <View style={ss.sg}>
                        <View style={[ss.sb, { borderColor: '#6366f1' }]}><Text style={[ss.sn, { color: '#818cf8' }]}>{st.u}</Text><Text style={ss.sl}>Utilisateurs</Text></View>
                        <View style={[ss.sb, { borderColor: '#10b981' }]}><Text style={[ss.sn, { color: '#34d399' }]}>{st.c}</Text><Text style={ss.sl}>Cours</Text></View>
                        <View style={[ss.sb, { borderColor: '#f59e0b' }]}><Text style={[ss.sn, { color: '#fbbf24' }]}>{st.n}</Text><Text style={ss.sl}>Notes</Text></View>
                        <View style={[ss.sb, { borderColor: '#ef4444' }]}><Text style={[ss.sn, { color: '#f87171' }]}>{st.p}</Text><Text style={ss.sl}>PDFs</Text></View>
                        <View style={[ss.sb, { borderColor: '#06b6d4' }]}><Text style={[ss.sn, { color: '#22d3ee' }]}>{st.l}</Text><Text style={ss.sl}>Liens</Text></View>
                    </View>
                </ScrollView>
            )}
            {at === 'visits' && vi && (
                <ScrollView contentContainerStyle={ss.cn}>
                    <View style={ss.sr}>
                        <View style={[ss.sb2, { borderColor: '#6366f1' }]}><Text style={[ss.sn, { color: '#818cf8' }]}>{vi.total}</Text><Text style={ss.sl}>Total</Text></View>
                        <View style={[ss.sb2, { borderColor: '#10b981' }]}><Text style={[ss.sn, { color: '#34d399' }]}>{vi.today}</Text><Text style={ss.sl}>Aujourd'hui</Text></View>
                        <View style={[ss.sb2, { borderColor: '#f59e0b' }]}><Text style={[ss.sn, { color: '#fbbf24' }]}>{vi.week}</Text><Text style={ss.sl}>7 jours</Text></View>
                    </View>
                    <Text style={[ss.stl, { color: cl.tx, marginTop: 20 }]}>📱 Plateformes</Text>
                    <View style={{ flexDirection: 'row', gap: 14 }}>
                        <View style={[ss.pc, { borderColor: '#6366f1' }]}><FontAwesome5 name="globe" size={28} color="#818cf8" /><Text style={[ss.plb, { color: cl.tx }]}>Web</Text><Text style={[ss.pn, { color: '#818cf8' }]}>{vi.platforms?.find(p => p.platform === 'web')?.count || 0}</Text><View style={ss.pb}><View style={[ss.pf, { width: `${vi.total > 0 ? ((vi.platforms?.find(p => p.platform === 'web')?.count || 0) / vi.total) * 100 : 0}%`, backgroundColor: '#6366f1' }]} /></View><Text style={ss.pp}>{vi.total > 0 ? Math.round(((vi.platforms?.find(p => p.platform === 'web')?.count || 0) / vi.total) * 100) : 0}%</Text></View>
                        <View style={[ss.pc, { borderColor: '#10b981' }]}><FontAwesome5 name="mobile-alt" size={32} color="#34d399" /><Text style={[ss.plb, { color: cl.tx }]}>Mobile</Text><Text style={[ss.pn, { color: '#34d399' }]}>{vi.platforms?.find(p => p.platform === 'mobile')?.count || 0}</Text><View style={ss.pb}><View style={[ss.pf, { width: `${vi.total > 0 ? ((vi.platforms?.find(p => p.platform === 'mobile')?.count || 0) / vi.total) * 100 : 0}%`, backgroundColor: '#10b981' }]} /></View><Text style={ss.pp}>{vi.total > 0 ? Math.round(((vi.platforms?.find(p => p.platform === 'mobile')?.count || 0) / vi.total) * 100) : 0}%</Text></View>
                    </View>
                    <Text style={[ss.stl, { color: cl.tx, marginTop: 20 }]}>📅 Fréquentation mensuelle</Text>
                    <View style={ss.prw}>
                        <TouchableOpacity style={[ss.pbt, { backgroundColor: cl.ib, borderColor: cl.bd }]} onPress={() => sshm(true)}><Text style={{ color: cl.tx, fontSize: 15, fontWeight: '600' }}>{months[sm - 1]}  <Text style={{ color: cl.ts, fontSize: 12 }}>▼</Text></Text></TouchableOpacity>
                        <TouchableOpacity style={[ss.pbt, { backgroundColor: cl.ib, borderColor: cl.bd }]} onPress={() => { syi(String(sy)); sshy(true); }}><Text style={{ color: cl.tx, fontSize: 15, fontWeight: '600' }}>{sy}  <Text style={{ color: cl.ts, fontSize: 12 }}>▼</Text></Text></TouchableOpacity>
                    </View>
                    {md && md.data && md.data.every(x => x.count === 0) ? (
                        <View style={[ss.em, { backgroundColor: cl.cd, borderColor: cl.bd }]}><FontAwesome5 name="info-circle" size={36} color={cl.ts} style={{ marginBottom: 10 }} /><Text style={{ color: cl.ts, fontSize: 14 }}>Aucune donnée pour ce mois.</Text></View>
                    ) : ch ? (
                        <WebView source={{ html: ch }} style={{ height: Math.max(300, (md?.daysInMonth || 30) * 26 + 30) }} scrollEnabled={false} originWhitelist={['*']} javaScriptEnabled />
                    ) : null}
                </ScrollView>
            )}
            <Modal visible={shm} transparent animationType="fade"><TouchableOpacity style={ss.mo} activeOpacity={1} onPress={() => sshm(false)}><View style={[ss.mc, { backgroundColor: cl.cd, borderColor: cl.bd }]}><FlatList data={months} keyExtractor={(_, i) => String(i)} style={{ maxHeight: 300 }} renderItem={({ item, index }) => (<TouchableOpacity style={[ss.mi, sm === index + 1 && { backgroundColor: cl.pr }]} onPress={() => { ssm(index + 1); sshm(false); lm(index + 1, sy); }}><Text style={[ss.mit, sm === index + 1 && { color: '#fff', fontWeight: '700' }]}>{item}</Text></TouchableOpacity>)} /></View></TouchableOpacity></Modal>
            <Modal visible={shy} transparent animationType="fade"><TouchableOpacity style={ss.mo} activeOpacity={1} onPress={() => sshy(false)}><View style={[ss.mc, { backgroundColor: cl.cd, borderColor: cl.bd }]}><TextInput style={[ss.yi, { backgroundColor: cl.ib, borderColor: cl.bd, color: cl.tx }]} placeholder="Saisir l'année" placeholderTextColor={cl.ts} value={yi} onChangeText={syi} keyboardType="numeric" maxLength={4} onSubmitEditing={() => { const y = parseInt(yi); if (y && y >= 2000 && y <= 2100) { ssy(y); sshy(false); lm(sm, y); } }} /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>{[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (<TouchableOpacity key={y} style={[ss.yc, sy === y && { backgroundColor: cl.pr }]} onPress={() => { ssy(y); sshy(false); lm(sm, y); }}><Text style={[ss.yct, sy === y && { color: '#fff', fontWeight: '700' }]}>{y}</Text></TouchableOpacity>))}</View></View></TouchableOpacity></Modal>
            {at === 'sql' && (
                <ScrollView contentContainerStyle={ss.cn}>
                    <TextInput style={[ss.qi, { backgroundColor: cl.ib, borderColor: cl.bd, color: cl.tx }]} placeholder="SELECT * FROM users..." placeholderTextColor={cl.ts} value={sq} onChangeText={v => { ssq(v); if (v.trim() === '') { ssr(null); sse(''); } }} multiline textAlignVertical="top" />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity style={[ss.qb, { flex: 1, backgroundColor: cl.pr }]} onPress={es} disabled={sl}>{sl ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Exécuter</Text>}</TouchableOpacity>
                        <TouchableOpacity style={[ss.qb, { backgroundColor: cl.ib, borderWidth: 1, borderColor: cl.bd }]} onPress={() => { ssq(''); ssr(null); sse(''); }}><Text style={{ color: cl.ts, fontWeight: '600' }}>Nettoyer</Text></TouchableOpacity>
                    </View>
                    {se ? <Text style={{ color: cl.dg, marginTop: 10 }}>{se}</Text> : null}
                    {sr?.data && (<View style={{ marginTop: 10 }}><Text style={{ color: cl.sc, marginBottom: 8 }}>{sr.data.length} résultat(s)</Text><ScrollView horizontal><View>{sr.data.slice(0, 30).map((row, i) => (<Text key={i} style={{ color: cl.tx, fontSize: 11, marginBottom: 4, fontFamily: 'monospace' }}>{JSON.stringify(row)}</Text>))}</View></ScrollView></View>)}
                </ScrollView>
            )}
        </View>
    );
}
const ss = StyleSheet.create({
    ct: { flex: 1 }, hd: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingTop: 50, borderBottomWidth: 1 }, ht: { fontSize: 18, fontWeight: '700' },
    tb: { flexDirection: 'row', padding: 8, gap: 4 }, ti: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }, cn: { padding: 16 },
    sg: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, sr: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    sb: { width: '30%', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, backgroundColor: '#0f172a' }, sb2: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, backgroundColor: '#0f172a' },
    sn: { fontSize: 24, fontWeight: '800' }, sl: { color: '#94a3b8', fontSize: 11, marginTop: 4, textTransform: 'uppercase', fontWeight: '600' },
    stl: { fontSize: 15, fontWeight: '700', marginBottom: 12 }, pc: { flex: 1, backgroundColor: '#0f172a', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2 },
    plb: { fontWeight: '700', fontSize: 13, marginTop: 6 }, pn: { fontWeight: '800', fontSize: 26, marginTop: 4 },
    pb: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }, pf: { height: '100%', borderRadius: 3 }, pp: { color: '#94a3b8', fontSize: 10, marginTop: 4 },
    prw: { flexDirection: 'row', gap: 12, marginBottom: 12 }, pbt: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center' },
    em: { alignItems: 'center', padding: 30, borderRadius: 16, borderWidth: 1 },
    mo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }, mc: { width: '80%', borderRadius: 16, padding: 16, borderWidth: 1, maxHeight: 400 },
    mi: { padding: 14, borderRadius: 10, marginBottom: 4 }, mit: { color: '#94a3b8', fontSize: 15, textAlign: 'center' },
    yi: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, textAlign: 'center', marginBottom: 8 }, yc: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' }, yct: { color: '#94a3b8', fontSize: 14 },
    qi: { borderWidth: 2, borderRadius: 12, padding: 14, fontSize: 13, fontFamily: 'monospace', minHeight: 100, marginBottom: 10 }, qb: { padding: 14, borderRadius: 12, alignItems: 'center' },
});