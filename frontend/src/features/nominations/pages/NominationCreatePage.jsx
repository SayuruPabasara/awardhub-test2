import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineUpload,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineExclamation,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { categoryApi } from '../../categories/api';
import { nominationApi } from '../api';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Loader from '../../../components/Loader';
import './NominationCreatePage.css';

export default function NominationCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCategoryId = searchParams.get('category');

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: preselectedCategoryId || '',
    title: '',
    achievementDescription: '',
    evidenceDetails: '',
    declaration: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCats(true);
        const res = await categoryApi.getOpenForNomination();
        setCategories(res?.data?.data || []);
        if (preselectedCategoryId) {
          const found = (res?.data?.data || []).find(
            (c) => c.categoryId.toString() === preselectedCategoryId.toString()
          );
          if (found) setSelectedCategory(found);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, [preselectedCategoryId]);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setFormData((prev) => ({ ...prev, categoryId: catId }));
    const found = categories.find((c) => c.categoryId.toString() === catId.toString());
    setSelectedCategory(found || null);
    setUploadedFiles({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileSelect = (docType, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File exceeds 10MB limit');
        return;
      }
      setUploadedFiles((prev) => ({ ...prev, [docType]: file }));
      toast.success(`Attached ${file.name} for ${docType}`);
    }
  };

  const handleSubmit = async (submitImmediately) => {
    if (!formData.categoryId) {
      toast.error('Please select an award category');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a nomination title');
      return;
    }
    if (!formData.achievementDescription.trim()) {
      toast.error('Please detail the key achievements');
      return;
    }
    if (!formData.declaration) {
      toast.error('You must agree to the declaration statement');
      return;
    }

    // Check mandatory documents if submitting immediately
    if (submitImmediately && selectedCategory?.requiredDocumentTypes) {
      for (const reqDoc of selectedCategory.requiredDocumentTypes) {
        if (!uploadedFiles[reqDoc]) {
          toast.error(`Please attach mandatory document: ${reqDoc}`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        categoryId: Number(formData.categoryId),
        title: formData.title,
        achievementDescription: formData.achievementDescription,
        evidenceDetails: formData.evidenceDetails,
        declaration: formData.declaration,
        submitImmediately,
      };

      const res = await nominationApi.create(payload);
      const createdNom = res?.data?.data;
      const nomId = createdNom?.nominationId;

      // Upload attached documents
      if (nomId && Object.keys(uploadedFiles).length > 0) {
        for (const [docType, file] of Object.entries(uploadedFiles)) {
          try {
            await nominationApi.uploadDocument(nomId, docType, file);
          } catch (uploadErr) {
            console.error(`Failed to upload ${docType}:`, uploadErr);
          }
        }
      }

      toast.success(
        submitImmediately
          ? 'Nomination submitted successfully!'
          : 'Nomination draft saved!'
      );
      navigate('/my-nominations');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit nomination. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCats) {
    return <Loader text="Loading available award categories..." />;
  }

  return (
    <div className="nomination-create-container">
      {/* Top navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          variant="ghost"
          size="sm"
          icon={HiOutlineArrowLeft}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>

      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-text">
          <h1>Submit Nomination Entry</h1>
          <p>
            Enter your project details, upload verified supporting evidence, and submit for
            panel evaluation.
          </p>
        </div>
      </div>

      <div className="nomination-form-card">
        {/* Section 1: Category Selection */}
        <div className="nomination-section">
          <div className="nomination-section-header">
            <span className="nomination-section-title">1. Target Award Category</span>
            <span className="nomination-section-sub">
              Select which category you are contesting for.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--slate-700)' }}>
              Award Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleCategoryChange}
              className="category-form-select"
              required
            >
              <option value="">-- Choose Category --</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Nomination Details */}
        <div className="nomination-section">
          <div className="nomination-section-header">
            <span className="nomination-section-title">2. Entry Details</span>
            <span className="nomination-section-sub">
              Provide a clear title and articulate the core impact and novelty.
            </span>
          </div>

          <Input
            label="Nomination Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Autonomous Robotic Drone System for Coastal Surveillance"
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--slate-700)' }}>
              Achievement & Contributions Description *
            </label>
            <textarea
              name="achievementDescription"
              value={formData.achievementDescription}
              onChange={handleChange}
              placeholder="Describe your achievements, technical innovation, methodologies, and outcomes..."
              className="category-form-textarea"
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--slate-700)' }}>
              Evidence & Metrics Summary
            </label>
            <textarea
              name="evidenceDetails"
              value={formData.evidenceDetails}
              onChange={handleChange}
              placeholder="Highlight quantitative metrics, user adoption stats, published patents, or citations..."
              className="category-form-textarea"
              rows={3}
            />
          </div>
        </div>

        {/* Section 3: Document Attachments */}
        {selectedCategory?.requiredDocumentTypes && selectedCategory.requiredDocumentTypes.length > 0 && (
          <div className="nomination-section">
            <div className="nomination-section-header">
              <span className="nomination-section-title">3. Supporting Documents</span>
              <span className="nomination-section-sub">
                Upload authentic verification documents mandated by category rules. Max 10MB each.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {selectedCategory.requiredDocumentTypes.map((docType) => {
                const attached = uploadedFiles[docType];
                return (
                  <div key={docType} className="nomination-doc-upload-box">
                    <div className="nomination-doc-info">
                      <span className="nomination-doc-type-badge">{docType}</span>
                      <span className="nomination-doc-title">
                        {attached ? attached.name : `Attach ${docType.replace(/_/g, ' ')}`}
                      </span>
                      {attached && (
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--success-700)' }}>
                          {(attached.size / 1024).toFixed(1)} KB • Ready to upload
                        </span>
                      )}
                    </div>

                    <label
                      style={{
                        padding: '6px 14px',
                        background: attached ? 'var(--success-50)' : '#ffffff',
                        border: attached ? '1px solid var(--success-300)' : '1px solid var(--slate-300)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 600,
                        color: attached ? 'var(--success-700)' : 'var(--slate-700)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <HiOutlineUpload size={14} />
                      {attached ? 'Replace File' : 'Browse File'}
                      <input
                        type="file"
                        onChange={(e) => handleFileSelect(docType, e)}
                        style={{ display: 'none' }}
                        accept=".pdf,.docx,.zip,.png,.jpg"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Declaration */}
        <div className="nomination-section">
          <div className="nomination-declaration-box">
            <input
              type="checkbox"
              id="declarationCheck"
              name="declaration"
              checked={formData.declaration}
              onChange={handleChange}
              required
            />
            <label htmlFor="declarationCheck" style={{ fontSize: 'var(--font-xs)', color: 'var(--primary-900)', lineHeight: '1.5' }}>
              <strong>Official Declaration:</strong> I hereby certify that all information,
              documents, and statements submitted in this entry are genuine, accurate, and reflect my
              authentic individual/team work. I agree to abide by the award evaluation rules and code
              of ethics.
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="nomination-form-actions">
          <Button
            variant="secondary"
            type="button"
            onClick={() => handleSubmit(false)}
            loading={submitting}
          >
            Save as Draft
          </Button>

          <Button
            variant="primary"
            type="button"
            icon={HiOutlineCheckCircle}
            onClick={() => handleSubmit(true)}
            loading={submitting}
          >
            Submit for Review
          </Button>
        </div>
      </div>
    </div>
  );
}
