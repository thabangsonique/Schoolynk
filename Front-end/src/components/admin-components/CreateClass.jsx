import React, { useState } from "react";
import { X } from "lucide-react";
import { useCreateClassMutation } from "../../features/api";

const initialForm = {
	name: "",
	room_number: "",
	grade: "",
	section: "",
	teacher_id: "",
	student_capacity: "32",
};

export default function CreateClass({ onClose, teachers = [], onCreated }) {
	const [form, setForm] = useState(initialForm);
	const [createClass, { isLoading, error }] = useCreateClassMutation();

	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm((previousForm) => ({ ...previousForm, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const className = form.name.trim();
		const section = form.section.trim();

		await createClass({
			name: section ? `${className} ${section}` : className,
			grade: Number(form.grade),
			room_number: form.room_number.trim() || undefined,
			student_capacity: 32,
			teacher_id: form.teacher_id || undefined,
		}).unwrap();

		if (onCreated) await onCreated();
		setForm(initialForm);
		onClose();
	};

	const inputClassName =
		"mt-1 w-full rounded-lg border border-text-secondary/10 bg-background px-3 py-3 text-sm text-white outline-none transition-colors focus:border-primary";
	const labelClassName = "text-sm font-semibold text-white";

	return (
		<div
			className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 backdrop-blur-md"
			onClick={onClose}
		>
			<form
				onSubmit={handleSubmit}
				onClick={(event) => event.stopPropagation()}
				className="w-full max-w-2xl overflow-hidden rounded-2xl border border-text-secondary/20 bg-card-2 text-white shadow-2xl"
			>
				<div className="flex items-start justify-between border-b border-text-secondary/10 bg-background px-6 py-4">
					<div>
						<h2 className="text-xl font-bold">Create Class</h2>
						<p className="mt-1 text-sm text-text-secondary">
							Configure a new elementary grade classroom
						</p>
					</div>
					<button type="button" onClick={onClose} className="text-text-secondary hover:text-white" aria-label="Close create class dialog">
						<X size={21} />
					</button>
				</div>

				<div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2">
					<label className={labelClassName}>
						Class Name
						<input name="name" value={form.name} onChange={handleChange} className={inputClassName} placeholder="Grade 4" required />
					</label>
					<label className={labelClassName}>
						Room Number
						<input name="room_number" value={form.room_number} onChange={handleChange} className={inputClassName} placeholder="Room 206" />
					</label>
					<label className={labelClassName}>
						Grade Level
						<select name="grade" value={form.grade} onChange={handleChange} className={inputClassName} required>
							<option value="">Select grade</option>
							{[1, 2, 3, 4, 5, 6, 7].map((grade) => (
								<option key={grade} value={grade}>Grade {grade}</option>
							))}
						</select>
					</label>
					<label className={labelClassName}>
						Section
						<input name="section" value={form.section} onChange={handleChange} className={inputClassName} placeholder="A" maxLength={3} required />
					</label>
					<label className={`${labelClassName} sm:col-span-2`}>
						Class Teacher
						<select name="teacher_id" value={form.teacher_id} onChange={handleChange} className={inputClassName}>
							<option value="">No teacher assigned</option>
							{teachers.map((teacher) => {
								const teacherName = `${teacher.profiles?.first_name ?? ""} ${teacher.profiles?.last_name ?? ""}`.trim();
								return <option key={teacher.id} value={teacher.id}>{teacherName || teacher.employee_number}</option>;
							})}
						</select>
					</label>
					<label className={labelClassName}>
						Student Capacity
						<input name="student_capacity" value={form.student_capacity} className={`${inputClassName} cursor-not-allowed opacity-70`} readOnly />
					</label>
					<label className={labelClassName}>
						Total Subjects
						<input value="0" className={`${inputClassName} cursor-not-allowed opacity-70`} readOnly />
					</label>
				</div>

				{error && <p className="px-6 pb-2 text-sm text-red-400">{error?.data?.message ?? "Failed to create class. Please try again."}</p>}

				<div className="flex justify-end gap-4 border-t border-text-secondary/10 px-6 py-4">
					<button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-white">Cancel</button>
					<button type="submit" disabled={isLoading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
						{isLoading ? "Saving..." : "Save Class"}
					</button>
				</div>
			</form>
		</div>
	);
}
