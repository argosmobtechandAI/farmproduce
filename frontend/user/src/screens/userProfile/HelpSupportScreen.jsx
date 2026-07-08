import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
} from 'react-native';
import {
    ChevronLeft,
    Search,
    MessageSquare,
    Mail,
    Phone,
    ChevronDown,
    HelpCircle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const faqsData = [
    {
        id: 1,
        question: 'How do I track my order?',
        answer: 'You can track your order by going to the "Orders" tab in the bottom navigation and selecting the active order you wish to track. Real-time updates and a map view will be available.'
    },
    {
        id: 2,
        question: 'What is the refund policy?',
        answer: 'If you receive damaged or incorrect produce, you can request a refund within 24 hours of delivery. Go to your order details and click "Request Refund" or contact our support team.'
    },
    {
        id: 3,
        question: 'How do I add a new delivery address?',
        answer: 'Navigate to Profile > Delivery Addresses and click the "Add New Address" button at the bottom of the screen.'
    },
    {
        id: 4,
        question: 'Can I change my delivery slot?',
        answer: 'Delivery slots can be changed up to 4 hours before the scheduled time. Open your active order and look for the "Change Slot" option.'
    }
];

const HelpSupportScreen = ({ onBack }) => {
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const filteredFaqs = faqsData.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <ChevronLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Help & Support</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputWrapper}>
                            <Search size={20} color="#94A3B8" />
                            <TextInput
                                placeholder="How can we help?"
                                style={styles.searchInput}
                                placeholderTextColor="#94A3B8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Contact Methods */}
                    <View style={styles.contactContainer}>
                        <Text style={styles.sectionTitle}>Contact Us</Text>
                        <View style={styles.contactGrid}>
                            <TouchableOpacity style={styles.contactCard}>
                                <View style={[styles.contactIcon, { backgroundColor: '#F0F9FF' }]}>
                                    <MessageSquare size={24} color="#0EA5E9" />
                                </View>
                                <Text style={styles.contactLabel}>Chat Support</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactCard}>
                                <View style={[styles.contactIcon, { backgroundColor: '#FDF2F8' }]}>
                                    <Mail size={24} color="#EC4899" />
                                </View>
                                <Text style={styles.contactLabel}>Email Us</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactCard}>
                                <View style={[styles.contactIcon, { backgroundColor: '#F0FDF4' }]}>
                                    <Phone size={24} color="#22C55E" />
                                </View>
                                <Text style={styles.contactLabel}>Call Center</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* FAQs */}
                    <View style={styles.faqSection}>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                        {filteredFaqs.map((faq) => (
                            <TouchableOpacity
                                key={faq.id}
                                style={styles.faqCard}
                                onPress={() => toggleFaq(faq.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqHeader}>
                                    <View style={styles.faqHeaderLeft}>
                                        <HelpCircle size={20} color="#0EA5E9" />
                                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    </View>
                                    <ChevronDown
                                        size={20}
                                        color="#94A3B8"
                                        style={{ transform: [{ rotate: expandedFaq === faq.id ? '180deg' : '0deg' }] }}
                                    />
                                </View>
                                {expandedFaq === faq.id && (
                                    <View style={styles.faqAnswerContainer}>
                                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    searchContainer: {
        marginBottom: 30,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1E293B',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 20,
    },
    contactContainer: {
        marginBottom: 40,
    },
    contactGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    contactCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    contactIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        textAlign: 'center',
    },
    faqSection: {
        gap: 12,
    },
    faqCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        flex: 1,
    },
    faqAnswerContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    faqAnswer: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 22,
    },
});

export default HelpSupportScreen;
