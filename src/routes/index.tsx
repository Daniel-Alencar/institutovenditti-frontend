import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LandingPage } from "@/components/legal/LandingPage";
import { AreaSelection } from "@/components/legal/AreaSelection";
import { QuestionnaireForm } from "@/components/legal/QuestionnaireForm";
import { UserDataForm } from "@/components/legal/UserDataForm";
import { ReportPreview } from "@/components/legal/ReportPreview";
import { TermsOfUseModal } from "@/components/legal/TermsOfUseModal";
import { LGPDTermsModal } from "@/components/legal/LGPDTermsModal";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { type LegalArea, type QuestionnaireResponse, type UserData } from "@/types/legal";
import { analyticsService } from "@/lib/data-service";

export const Route = createFileRoute("/")({
	component: App,
});

type AppStep = 'landing' | 'area-selection' | 'questionnaire' | 'user-data' | 'report';

function App() {
	// Check if admin mode is requested via URL parameter
	const searchParams = new URLSearchParams(window.location.search);
	const isAdminMode = searchParams.get('admin') === 'true';

	const [currentStep, setCurrentStep] = useState<AppStep>('landing');
	const [selectedArea, setSelectedArea] = useState<LegalArea | null>(null);
	const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
	const [userData, setUserData] = useState<UserData | null>(null);
	const [showTermsModal, setShowTermsModal] = useState(false);
	const [showLGPDModal, setShowLGPDModal] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [lgpdAccepted, setLgpdAccepted] = useState(false);
	const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
		return localStorage.getItem('adminAuthenticated') === 'true';
	});

	// Check if terms and LGPD were previously accepted
	useEffect(() => {
		const termsOk = localStorage.getItem('termsAccepted') === 'true';
		const lgpdOk = localStorage.getItem('lgpdAccepted') === 'true';
		setTermsAccepted(termsOk);
		setLgpdAccepted(lgpdOk);
	}, []);

	// Admin login handler
	const handleAdminLogin = (password: string) => {
		const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
		if (password === ADMIN_PASSWORD) {
			localStorage.setItem('adminAuthenticated', 'true');
			setIsAdminAuthenticated(true);
			return true;
		}
		return false;
	};

	// Admin logout handler
	const handleAdminLogout = () => {
		localStorage.removeItem('adminAuthenticated');
		setIsAdminAuthenticated(false);
		window.location.href = '/';
	};

	// If in admin mode, show admin interface
	if (isAdminMode) {
		if (!isAdminAuthenticated) {
			return <AdminLogin onLogin={handleAdminLogin} />;
		}
		return <AdminDashboard onLogout={handleAdminLogout} />;
	}

	const handleStartDiagnostic = () => {
		// Check if both terms and LGPD were already accepted
		if (termsAccepted && lgpdAccepted) {
			setCurrentStep('area-selection');
		} else if (!termsAccepted) {
			// Start with Terms of Use
			setShowTermsModal(true);
		} else if (!lgpdAccepted) {
			// If terms accepted but not LGPD, show LGPD
			setShowLGPDModal(true);
		}
	};

	const handleTermsAccept = () => {
		setTermsAccepted(true);
		setShowTermsModal(false);
		// After accepting terms, show LGPD modal
		setShowLGPDModal(true);
	};

	const handleTermsDecline = () => {
		setShowTermsModal(false);
		// Stay on landing page
	};

	const handleLGPDAccept = () => {
		setLgpdAccepted(true);
		setShowLGPDModal(false);
		// Only proceed to area selection after both acceptances
		setCurrentStep('area-selection');
	};

	const handleLGPDDecline = () => {
		setShowLGPDModal(false);
		// Stay on landing page
	};

	const handleAreaSelected = (area: LegalArea) => {
		setSelectedArea(area);
		setCurrentStep('questionnaire');
	};

	const handleQuestionnaireComplete = (questionnaireResponses: QuestionnaireResponse[]) => {
		setResponses(questionnaireResponses);
		setCurrentStep('user-data');
	};

	const handleUserDataSubmit = (data: UserData) => {
		setUserData(data);

		// Increment questionnaire counter with the selected area
		if (selectedArea) {
			analyticsService.incrementQuestionnaire(selectedArea.name);
		}

		setCurrentStep('report');
	};

	const handleBackToStart = () => {
		setCurrentStep('landing');
		setSelectedArea(null);
		setResponses([]);
		setUserData(null);
	};

	return (
		<div className="min-h-screen">
			{/* Terms of Use Modal - Shows first */}
			<TermsOfUseModal
				open={showTermsModal}
				onAccept={handleTermsAccept}
				onDecline={handleTermsDecline}
			/>

			{/* LGPD Terms Modal - Shows after Terms of Use acceptance */}
			<LGPDTermsModal
				open={showLGPDModal}
				onAccept={handleLGPDAccept}
				onDecline={handleLGPDDecline}
			/>

			{currentStep === 'landing' && (
				<LandingPage onStart={handleStartDiagnostic} />
			)}

			{currentStep === 'area-selection' && (
				<AreaSelection onAreaSelect={handleAreaSelected} onBack={handleBackToStart} />
			)}

			{currentStep === 'questionnaire' && selectedArea && (
				<QuestionnaireForm
					area={selectedArea}
					onComplete={handleQuestionnaireComplete}
					onBack={() => setCurrentStep('area-selection')}
				/>
			)}

			{currentStep === 'user-data' && selectedArea && (
				<UserDataForm
					onSubmit={handleUserDataSubmit}
					onBack={() => setCurrentStep('questionnaire')}
				/>
			)}

			{currentStep === 'report' && selectedArea && userData && (
				<ReportPreview
					area={selectedArea}
					responses={responses}
					userData={userData}
					onBackToStart={handleBackToStart}
				/>
			)}
		</div>
	);
}
