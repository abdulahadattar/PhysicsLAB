import type { SearchResult, NavItem, SimulationTopic, QuizTopic, StudyGrade, SettingsKeyword } from '@/lib/types';
import { FileTextIcon, ListChecks, SettingsIcon, BookOpen } from 'lucide-react';

const MAX_RESULTS = 20;

interface SearchSources {
    navItems: NavItem[];
    simulations: SimulationTopic[];
    quizzes: QuizTopic[];
    settings: SettingsKeyword[];
    studyGrades: StudyGrade[];
}

/**
 * A pure function that performs a search across multiple data sources.
 * @param query The search query string.
 * @param sources An object containing all data arrays to search through.
 * @returns A deduplicated and limited array of SearchResult.
 */
export const performSearch = (query: string, sources: SearchSources): SearchResult[] => {
    if (!query.trim()) {
        return [];
    }
    
    const lowerQuery = query.toLowerCase();
    let results: SearchResult[] = [];

    // Search NAV_ITEMS and their sub-items
    sources.navItems.forEach(item => {
        if (item.label.toLowerCase().includes(lowerQuery)) {
            const href = item.href === '#' && item.subItems?.[0] ? item.subItems[0].href : (item.href || '/');
            results.push({ id: `nav-${item.label.replace(/\s+/g, '-')}`, label: item.label, href, category: 'Navigation', icon: item.icon });
        }
        item.subItems?.forEach(subItem => {
            if (subItem.label.toLowerCase().includes(lowerQuery)) {
                results.push({ id: `nav-${subItem.href.replace(/\//g, '-')}`, label: `${item.label} > ${subItem.label}`, href: subItem.href, category: 'Navigation', icon: subItem.icon });
            }
        });
    });

    // Search SIMULATION_TOPICS by name, description, or category
    sources.simulations.forEach(sim => {
        const isMatch = sim.name.toLowerCase().includes(lowerQuery) ||
                        sim.description?.toLowerCase().includes(lowerQuery) ||
                        sim.categories?.some(cat => cat.toLowerCase().includes(lowerQuery));
        if (isMatch) {
            results.push({ id: `sim-${sim.id}`, label: sim.name, href: `/simulations/${sim.id}`, category: 'Simulation', icon: sim.icon, description: sim.description });
        }
    });

    // Search QUIZ_TOPICS by name or description
    sources.quizzes.forEach(quiz => {
        if (quiz.name.toLowerCase().includes(lowerQuery) || quiz.description?.toLowerCase().includes(lowerQuery)) {
            results.push({ id: `quiz-${quiz.id}`, label: quiz.name, href: `/quizzes/topic/${quiz.id}`, category: 'Quiz Topic', icon: quiz.icon || ListChecks, description: quiz.description });
        }
    });

    // Search Study Material grades and chapters
    sources.studyGrades?.forEach(grade => {
        if (grade.name.toLowerCase().includes(lowerQuery)) {
            results.push({ id: `grade-${grade.id}`, label: grade.name, href: `/study-material/${grade.id}`, category: 'Study Grade', icon: BookOpen });
        }
        grade.chapters?.forEach(chapter => {
            if (chapter.name.toLowerCase().includes(lowerQuery)) {
                results.push({ id: `chapter-${chapter.id}`, label: `${grade.name} > ${chapter.name}`, href: `/study-material/${grade.id}/${chapter.id}`, category: 'Study Chapter', icon: FileTextIcon });
            }
        });
    });

    // Search Settings Keywords
    sources.settings.forEach(setting => {
        if (setting.term.toLowerCase().includes(lowerQuery) || setting.label.toLowerCase().includes(lowerQuery)) {
            results.push({ id: `setting-${setting.term.replace(/\s+/g, '-')}`, label: setting.label, href: setting.href, category: 'Settings', icon: SettingsIcon });
        }
    });

    // Deduplicate results based on the href to avoid showing the same link twice, then limit the count.
    const uniqueResults = Array.from(new Map(results.map(item => [item.href, item])).values());

    return uniqueResults.slice(0, MAX_RESULTS);
};