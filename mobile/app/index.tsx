// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    FlatList, Alert, Modal, SafeAreaView, Platform, StatusBar, ActivityIndicator, Keyboard, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// 📡 API AYARI
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export default function BankingApp() {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState<string>('0.00');
    const [accountId, setAccountId] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoginView, setIsLoginView] = useState(true);

    // 🔥 DÜZELTME BURADA: İsmi 'transferVisible' yaptık
    const [transferVisible, setTransferVisible] = useState(false);
    const [depositVisible, setDepositVisible] = useState(false);

    const [amount, setAmount] = useState('');
    const [transferToId, setTransferToId] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Yardımcılar ---
    const getErrorMessage = (error: any) => {
        if (error.response?.data?.details) {
            return error.response.data.details.map((d: any) => `• ${d.message}`).join('\n');
        }
        return error.response?.data?.error || "İşlem başarısız.";
    };

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['token', 'user', 'accountId']);
        setToken(null); setUser(null); setAccountId(null); setTransactions([]);
    };

    useEffect(() => { checkLogin(); }, []);

    const checkLogin = async () => {
        try {
            const savedToken = await AsyncStorage.getItem('token');
            const savedUser = await AsyncStorage.getItem('user');
            const savedAccountId = await AsyncStorage.getItem('accountId');

            if (savedToken && savedUser) {
                setToken(savedToken);
                const userData = JSON.parse(savedUser);
                setUser(userData);
                if (savedAccountId) setAccountId(parseInt(savedAccountId));

                fetchAccountData(savedToken, userData.id);
                fetchHistory(savedToken);
            }
        } catch (e) { console.log(e); }
    };

    const fetchAccountData = async (currentToken: string, userId: number) => {
        try {
            const res = await axios.get(`${API_URL}/accounts/${userId}`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            setBalance(res.data.balance);
            if (res.data.id) {
                setAccountId(res.data.id);
                AsyncStorage.setItem('accountId', res.data.id.toString());
            }
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) handleLogout();
        }
    };

    const fetchHistory = async (currentToken: string) => {
        try {
            const res = await axios.get(`${API_URL}/transactions/history`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            setTransactions(res.data.history);
        } catch (error) { console.log("Geçmiş hatası"); }
    };

    const handleAuth = async () => {
        const endpoint = isLoginView ? '/auth/login' : '/auth/register';
        const payload = isLoginView ? { email, password } : { fullName, email, password };
        try {
            const res = await axios.post(`${API_URL}${endpoint}`, payload);
            const data = res.data;
            const userToken = data.token || data.data?.token;
            const accId = data.accountId || data.data?.account?.id;

            if (userToken) {
                const userData = isLoginView ? data.user : data.data.user;
                await AsyncStorage.setItem('token', userToken);
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                if (accId) await AsyncStorage.setItem('accountId', accId.toString());

                setToken(userToken); setUser(userData);
                if (accId) setAccountId(accId);
                fetchAccountData(userToken, userData.id);
                fetchHistory(userToken);
            } else if (!isLoginView && (res.status === 201 || res.status === 200)) {
                Alert.alert("Başarılı 🎉", "Kaydınız oluşturuldu! Lütfen giriş yapın.");
                setIsLoginView(true); setPassword('');
            }
        } catch (error: any) { Alert.alert("Hata", getErrorMessage(error)); }
    };

    const handleTransfer = async () => {
        if (!amount || !transferToId) return Alert.alert("Eksik", "Bilgileri giriniz.");
        try {
            setLoading(true);
            await axios.post(`${API_URL}/transactions/transfer`, {
                toAccountId: parseInt(transferToId),
                amount: parseFloat(amount)
            }, { headers: { Authorization: `Bearer ${token}` } });

            Alert.alert("Başarılı ✅", "Transfer gerçekleşti");
            setTransferVisible(false); // Düzeltildi
            setAmount(''); setTransferToId('');
            if (token && user) { fetchAccountData(token, user.id); fetchHistory(token); }
        } catch (e: any) {
            if (e.response?.status === 403) handleLogout();
            else Alert.alert("Hata", getErrorMessage(e));
        } finally { setLoading(false); }
    };

    const handleDeposit = async () => {
        if (!amount) return Alert.alert("Hata", "Tutar giriniz.");
        try {
            setLoading(true);
            await axios.post(`${API_URL}/transactions/deposit`, {
                accountId: accountId, amount: parseFloat(amount)
            }, { headers: { Authorization: `Bearer ${token}` } });

            Alert.alert("Başarılı ✅", "Para yüklendi");
            setDepositVisible(false); setAmount('');
            if (token && user) { fetchAccountData(token, user.id); fetchHistory(token); }
        } catch (e: any) { Alert.alert("Hata", getErrorMessage(e)); }
        finally { setLoading(false); }
    };

    // --- UI BİLEŞENLERİ ---

    const renderTransaction = ({ item }: { item: any }) => {
        const isDeposit = item.type === 'DEPOSIT';
        const isIncoming = isDeposit || item.toAccountId === accountId;
        const color = isIncoming ? '#27ae60' : '#e74c3c'; // Yeşil / Kırmızı
        const sign = isIncoming ? '+' : '-';

        const iconBg = isIncoming ? '#eafaf1' : '#fdedec';
        const icon = isDeposit ? '🏦' : (isIncoming ? '↙️' : '↗️');

        let title = isDeposit ? 'Para Yükleme' : (isIncoming ? `${item.fromAccount?.user?.fullName}` : `${item.toAccount?.user?.fullName}`);
        let subTitle = isDeposit ? 'ATM' : (isIncoming ? 'Gelen Transfer' : 'Giden Transfer');

        return (
            <View style={styles.transItem}>
                <View style={[styles.transIconBox, { backgroundColor: iconBg }]}>
                    <Text style={{ fontSize: 22 }}>{icon}</Text>
                </View>
                <View style={styles.transInfo}>
                    <Text style={styles.transTitle}>{title}</Text>
                    <Text style={styles.transDate}>{subTitle} • {new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.transAmount, { color }]}>{sign}₺{item.amount}</Text>
            </View>
        );
    };

    // --- EKRAN: GİRİŞ / KAYIT ---
    if (!token) {
        return (
            <SafeAreaView style={styles.authContainer}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.authHeader}>
                    <View style={styles.logoCircle}>
                        <Text style={{ fontSize: 40 }}>💸</Text>
                    </View>
                    <Text style={styles.authTitle}>SecureWallet</Text>
                    <Text style={styles.authSubtitle}>Yeni nesil finansal özgürlük</Text>
                </View>

                <View style={styles.authForm}>
                    {!isLoginView && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Ad Soyad</Text>
                            <TextInput style={styles.input} placeholder="Örn: Ali Yılmaz" value={fullName} onChangeText={setFullName} placeholderTextColor="#999" />
                        </View>
                    )}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>E-Posta</Text>
                        <TextInput style={styles.input} placeholder="ornek@mail.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#999" />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Şifre</Text>
                        <TextInput style={styles.input} placeholder="••••••" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#999" />
                    </View>

                    <TouchableOpacity style={styles.mainBtn} onPress={handleAuth}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{isLoginView ? "Giriş Yap" : "Hesap Oluştur"}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsLoginView(!isLoginView)} style={{ marginTop: 20 }}>
                        <Text style={styles.switchText}>
                            {isLoginView ? "Hesabın yok mu? " : "Zaten üye misin? "}
                            <Text style={{ fontWeight: 'bold', color: '#2d3436' }}>Tıkla</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // --- EKRAN: DASHBOARD ---
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 1. HEADER (Profil & Çıkış) */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.username}>{user?.fullName}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.profileBtn}>
                    <Text style={{ fontSize: 20 }}>👤</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>

                {/* 2. KREDİ KARTI GÖRÜNÜMÜ */}
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <View style={styles.cardTop}>
                            <Text style={styles.cardChip}>💳</Text>
                            <Text style={styles.cardBank}>SECURE BANK</Text>
                        </View>
                        <View>
                            <Text style={styles.cardLabel}>Toplam Bakiye</Text>
                            <Text style={styles.cardBalance}>₺{balance}</Text>
                        </View>
                        <View style={styles.cardBottom}>
                            <Text style={styles.cardHolder}>{user?.fullName?.toUpperCase()}</Text>
                            <Text style={styles.cardId}>ID: {accountId || '...'}</Text>
                        </View>
                    </View>
                </View>

                {/* 3. HIZLI İŞLEMLER (YUVARLAK BUTONLAR) */}
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => { setAmount(''); setTransferVisible(true) }}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#e3f2fd' }]}>
                            <Text style={{ fontSize: 24 }}>💸</Text>
                        </View>
                        <Text style={styles.actionText}>Transfer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => { setAmount(''); setDepositVisible(true) }}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#e8f5e9' }]}>
                            <Text style={{ fontSize: 24 }}>➕</Text>
                        </View>
                        <Text style={styles.actionText}>Yükle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#fff3e0' }]}>
                            <Text style={{ fontSize: 24 }}>🧾</Text>
                        </View>
                        <Text style={styles.actionText}>Fatura</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#f3e5f5' }]}>
                            <Text style={{ fontSize: 24 }}>⚙️</Text>
                        </View>
                        <Text style={styles.actionText}>Ayarlar</Text>
                    </TouchableOpacity>
                </View>

                {/* 4. SON İŞLEMLER */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Son İşlemler</Text>
                    <TouchableOpacity><Text style={{ color: '#6c5ce7', fontWeight: '600' }}>Tümü</Text></TouchableOpacity>
                </View>

                <FlatList
                    data={transactions}
                    scrollEnabled={false} // ScrollView içinde olduğu için
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTransaction}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={{ fontSize: 40, opacity: 0.5 }}>📜</Text>
                            <Text style={{ color: '#999', marginTop: 10 }}>Henüz bir işlem yok.</Text>
                        </View>
                    }
                />
            </ScrollView>

            {/* MODALLAR */}
            <Modal visible={transferVisible} animationType="slide" transparent>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => Keyboard.dismiss()}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Para Transferi</Text>

                        <Text style={styles.label}>Kime (Hesap ID)</Text>
                        <TextInput style={styles.modalInput} placeholder="Örn: 2" keyboardType="numeric" value={transferToId} onChangeText={setTransferToId} />

                        <Text style={styles.label}>Tutar</Text>
                        <View style={styles.amountWrapper}>
                            <Text style={styles.currencySymbol}>₺</Text>
                            <TextInput style={styles.amountInput} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.btnCancel} onPress={() => setTransferVisible(false)}><Text style={styles.btnCancelText}>İptal</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.btnConfirm} onPress={handleTransfer} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnConfirmText}>Gönder</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={depositVisible} animationType="slide" transparent>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => Keyboard.dismiss()}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Bakiye Yükle</Text>

                        <Text style={styles.label}>Yüklenecek Tutar</Text>
                        <View style={styles.amountWrapper}>
                            <Text style={styles.currencySymbol}>₺</Text>
                            <TextInput style={styles.amountInput} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.btnCancel} onPress={() => setDepositVisible(false)}><Text style={styles.btnCancelText}>İptal</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.btnConfirm, { backgroundColor: '#27ae60' }]} onPress={handleDeposit} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnConfirmText}>Yükle</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Genel
    container: { flex: 1, backgroundColor: '#f8f9fa' },

    // Auth Ekranı
    authContainer: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 30 },
    authHeader: { alignItems: 'center', marginBottom: 40 },
    logoCircle: { width: 80, height: 80, backgroundColor: '#f1f2f6', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    authTitle: { fontSize: 28, fontWeight: '800', color: '#2d3436' },
    authSubtitle: { fontSize: 16, color: '#b2bec3', marginTop: 5 },
    authForm: { width: '100%' },
    inputContainer: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#636e72', marginBottom: 8 },
    input: { backgroundColor: '#f1f2f6', padding: 16, borderRadius: 12, fontSize: 16, color: '#2d3436' },
    mainBtn: { backgroundColor: '#2d3436', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    mainBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    switchText: { textAlign: 'center', color: '#636e72', fontSize: 14 },

    // Dashboard Header
    header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
    greeting: { fontSize: 14, color: '#636e72' },
    username: { fontSize: 20, fontWeight: 'bold', color: '#2d3436' },
    profileBtn: { width: 40, height: 40, backgroundColor: '#f1f2f6', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

    // Kredi Kartı
    cardContainer: { padding: 20 },
    card: { backgroundColor: '#2d3436', borderRadius: 24, padding: 25, height: 200, justifyContent: 'space-between', shadowColor: '#2d3436', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardChip: { fontSize: 24 },
    cardBank: { color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: 1 },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 5 },
    cardBalance: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardHolder: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
    cardId: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

    // Aksiyonlar
    actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
    actionItem: { alignItems: 'center', width: '22%' },
    actionIconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    actionText: { fontSize: 12, fontWeight: '600', color: '#2d3436' },

    // Liste
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3436' },
    transItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12, padding: 15, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    transIconBox: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    transInfo: { flex: 1 },
    transTitle: { fontSize: 16, fontWeight: 'bold', color: '#2d3436' },
    transDate: { fontSize: 12, color: '#b2bec3', marginTop: 4 },
    transAmount: { fontSize: 16, fontWeight: 'bold' },
    emptyState: { alignItems: 'center', marginTop: 30 },

    // Modallar
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
    modalHandle: { width: 40, height: 5, backgroundColor: '#dfe6e9', borderRadius: 2.5, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d3436', textAlign: 'center', marginBottom: 25 },
    label: { fontSize: 14, fontWeight: '600', color: '#636e72', marginBottom: 10 },
    modalInput: { backgroundColor: '#f1f2f6', padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 'bold', color: '#2d3436', marginBottom: 20 },
    amountWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f2f6', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
    currencySymbol: { fontSize: 24, color: '#2d3436', fontWeight: 'bold', marginRight: 10 },
    amountInput: { flex: 1, paddingVertical: 16, fontSize: 24, fontWeight: 'bold', color: '#2d3436' },
    modalButtons: { flexDirection: 'row', gap: 15 },
    btnCancel: { flex: 1, backgroundColor: '#dfe6e9', padding: 18, borderRadius: 14, alignItems: 'center' },
    btnCancelText: { fontSize: 16, fontWeight: 'bold', color: '#636e72' },
    btnConfirm: { flex: 2, backgroundColor: '#2d3436', padding: 18, borderRadius: 14, alignItems: 'center' },
    btnConfirmText: { fontSize: 16, fontWeight: 'bold', color: '#fff' }
});