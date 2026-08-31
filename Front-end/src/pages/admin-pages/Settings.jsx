import React, { useState, useEffect } from "react";
import {
  School,
  MapPin,
  Clock,
  AlarmClock,
  Radio,
  Bell,
  BellOff,
  Loader2,
  Save,
  Mail,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import {
  useGetSchoolSettingsQuery,
  useUpdateNotificationsEnabledMutation,
} from "../../features/api";

export default function Settings() {
  const { user, profile } = useAuth();

  //fetch the configured school settings.
  const {
    data: school,
    isLoading,
    isError,
    error: errorInfo,
    refetch: refetchSchool,
  } = useGetSchoolSettingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  //update the notification preference.
  const [updateNotifications, { isLoading: isSaving }] =
    useUpdateNotificationsEnabledMutation();

  //local toggle state, synced from the fetched settings.
  const [notifications, setNotifications] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  //debug logging for errors
  useEffect(() => {
    if (isError) {
      console.error("School settings fetch error:", errorInfo);
    }
  }, [isError, errorInfo]);

  //sync the toggle with the fetched value.
  useEffect(() => {
    if (school && typeof school.notifications_enabled === "boolean") {
      setNotifications(school.notifications_enabled);
    }
  }, [school]);

  const handleToggleNotifications = async (value) => {
    setFeedback(null);
    setErrorMsg(null);
    setNotifications(value);

    try {
      await updateNotifications({ enabled: value }).unwrap();
      setFeedback(
        `Notifications ${value ? "enabled" : "disabled"} for recent school updates.`,
      );
      refetchSchool();
    } catch (err) {
      setNotifications(!value); //revert on failure.
      setErrorMsg(
        err?.data?.message ??
          "Failed to update notification preference. Try again.",
      );
    }
  };

  //format a time value (''HH:MM:SS'') to a 12-hour string.
  const formatTime = (value) => {
    if (!value) return "—";
    const [h, m] = value.split(":");
    const date = new Date();
    date.setHours(Number(h), Number(m), 0, 0);
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const profileRows = [
    {
      label: "School Name",
      value: school?.school_name ?? "—",
      icon: <School size={18} />,
    },
    {
      label: "Geofence Radius",
      value: school?.geo_radius_meters ? `${school.geo_radius_meters} m` : "—",
      icon: <Radio size={18} />,
    },
    {
      label: "Location",
      value:
        school?.geo_latitude != null && school?.geo_longitude != null
          ? `${Number(school.geo_latitude).toFixed(5)}, ${Number(
              school.geo_longitude,
            ).toFixed(5)}`
          : "—",
      icon: <MapPin size={18} />,
    },
    {
      label: "Expected Clock-in Start",
      value: formatTime(school?.clock_in_start),
      icon: <Clock size={18} />,
    },
    {
      label: "Clock-in Deadline",
      value: formatTime(school?.clock_in_deadline),
      icon: <AlarmClock size={18} />,
    },
  ];

  return (
    <div className="text-white py-10 px-10">
      {/* header */}
      <div>
        <h1 className="text-white text-4xl font-bold">Settings</h1>
        <p className="text-text-secondary mt-3 text-lg">
          View your school profile and manage your preferences.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* school profile card */}
        <div className="bg-card-2 rounded-2xl border border-text-secondary/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-xl tracking-wide">
              School Profile
            </h2>
            <div className="bg-primary/10 p-3 rounded-xl">
              <School className="text-primary" />
            </div>
          </div>

          {isLoading && (
            <p className="text-text-secondary mt-6">
              Loading school settings...
            </p>
          )}

          {isError && (
            <p className="text-red-500 mt-6">
              {errorInfo?.data?.message ?? "Failed to load school settings."}
            </p>
          )}

          {!isLoading && !isError && (
            <div className="mt-5">
              {profileRows.map((row, idx) => (
                <div
                  key={row.label}
                  className={`flex items-center gap-4 py-3 px-2 ${
                    idx < profileRows.length - 1
                      ? "border-b border-text-secondary/10"
                      : ""
                  }`}
                >
                  {row.icon && (
                    <span className="text-text-secondary shrink-0">
                      {row.icon}
                    </span>
                  )}
                  <span className="text-text-secondary text-sm flex-1">
                    {row.label}
                  </span>
                  <span className="text-white font-semibold text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* notifications preference card */}
        <div className="bg-card-2 rounded-2xl border border-text-secondary/10 p-6">
          <h2 className="text-white font-bold text-xl tracking-wide">
            Notifications
          </h2>

          <div className="mt-5 bg-background border border-text-secondary/10 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div
                className={`shrink-0 rounded-xl p-4 flex items-center justify-center ${
                  notifications
                    ? "bg-primary/10 text-primary"
                    : "bg-text-secondary/10 text-text-secondary"
                }`}
              >
                {notifications ? <Bell size={22} /> : <BellOff size={22} />}
              </div>

              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">
                  {notifications
                    ? "Recent activity notifications on"
                    : "Recent activity notifications off"}
                </h3>
                <p className="text-text-secondary text-sm mt-1">
                  Get notified when teachers clock in or complete the attendance
                  register, shown on the bell icon.
                </p>

                {/* toggle switch */}
                <button
                  onClick={() => handleToggleNotifications(!notifications)}
                  disabled={isSaving}
                  className="mt-4 flex items-center gap-3 group cursor-pointer disabled:opacity-60"
                >
                  <span
                    className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${
                      notifications ? "bg-text-green" : "bg-text-secondary/30"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all duration-300 ${
                        notifications ? "left-7" : "left-1"
                      }`}
                    />
                  </span>
                  <span className="text-text-secondary text-sm group-hover:text-white transition-colors">
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </span>
                    ) : notifications ? (
                      "Notifications enabled"
                    ) : (
                      "Notifications disabled"
                    )}
                  </span>
                </button>

                {feedback && (
                  <p className="mt-3 bg-text-green/10 border border-text-green/20 text-text-green rounded-xl px-3 py-2 text-sm">
                    {feedback}
                  </p>
                )}
                {errorMsg && (
                  <p className="mt-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-3 py-2 text-sm">
                    {errorMsg}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* admin account card */}
          <div className="mt-5 bg-card-2 rounded-2xl border border-text-secondary/10 p-5">
            <h3 className="text-white font-bold text-lg tracking-wide">
              Administrator Account
            </h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-text-secondary shrink-0">Name</span>
                <span className="text-white font-semibold ml-auto">
                  {profile?.first_name ?? ""} {profile?.last_name ?? ""}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-text-secondary shrink-0" size={16} />
                <span className="text-text-secondary text-sm flex-1">
                  Email
                </span>
                <span className="text-white font-semibold text-sm text-right">
                  {user?.email ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
