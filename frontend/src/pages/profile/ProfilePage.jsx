import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { FaArrowLeft, FaLink } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";

import Posts from "../posts/Posts";
import EditProfileModal from "./EditProfileModal";
import ProfileHeaderSkeleton from "../../components/skeleton/ProfileHeaderSkeleton";
import { formatMemberSinceDate } from "../../utils/date/dateFun";
import { fetchAuthUser } from "../../components/sidebar/service";
import useFollow from "../../hooks/useFollow";
import { POSTS } from "../../utils/dummy";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);
  const { username } = useParams();

  const { follow, isPending } = useFollow();
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchAuthUser,
  });

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch(`/api/users/profile/${username}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
  });

  const isMyProfile = authUser?._id === user?.user?._id;
  const amIFollowing = authUser?.following.includes(user?.user?._id);
  const memberSinceDate = formatMemberSinceDate(user?.user?.createdAt);

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImg, profileImg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      state === "coverImg" && setCoverImg(reader.result);
      state === "profileImg" && setProfileImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  if (isLoading || isRefetching) return <ProfileHeaderSkeleton />;
  if (!user) return <p className="text-center text-lg mt-4">User not found</p>;

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex gap-10 px-4 py-2 items-center">
          <Link to="/">
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <p className="font-bold text-lg">{user?.user?.fullName}</p>
            <span className="text-sm text-slate-500">
              {POSTS?.length} posts
            </span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative group/cover">
          <img
            src={coverImg || user?.user?.coverImg || "/cover.png"}
            className="h-52 w-full object-cover"
            alt="cover"
          />

          {isMyProfile && (
            <div
              className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
              onClick={() => coverImgRef.current.click()}
            >
              <MdEdit className="w-5 h-5 text-white" />
            </div>
          )}

          <input
            type="file"
            hidden
            ref={coverImgRef}
            onChange={(e) => handleImgChange(e, "coverImg")}
          />
          <input
            type="file"
            hidden
            ref={profileImgRef}
            onChange={(e) => handleImgChange(e, "profileImg")}
          />

          {/* Avatar */}
          <div className="avatar absolute -bottom-16 left-4">
            <div className="w-32 rounded-full relative group/avatar">
              <img
                src={
                  profileImg ||
                  user?.user?.profileImg ||
                  "/avatar-placeholder.png"
                }
                alt="avatar"
              />
              {isMyProfile && (
                <div
                  className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer"
                  onClick={() => profileImgRef.current.click()}
                >
                  <MdEdit className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Controls */}
        <div className="flex justify-end px-4 mt-5">
          {isMyProfile ? (
            <EditProfileModal authUser={authUser} />
          ) : (
            <button
              className="btn btn-outline rounded-full btn-sm"
              onClick={() => follow(user?.user?._id)}
            >
              {isPending ? "Loading..." : amIFollowing ? "UnFollow" : "Follow"}
            </button>
          )}

          {(coverImg || profileImg) && (
            <button
              className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
              onClick={() => updateProfile()}
            >
              {isUpdatingProfile ? "Updating..." : "Update"}
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex flex-col gap-4 mt-14 px-4">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{user?.fullName}</span>
            <span className="text-sm text-slate-500">
              @{user?.user?.username}
            </span>
            <span className="text-sm my-1">{user?.user?.bio}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            {user?.user?.link && (
              <div className="flex items-center gap-1">
                <FaLink className="w-3 h-3" />
                <a
                  href={
                    user.user.link.startsWith("http")
                      ? user.user.link
                      : `https://${user.user.link}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {(() => {
                    try {
                      const url = new URL(
                        user.user.link.startsWith("http")
                          ? user.user.link
                          : `https://${user.user.link}`
                      );
                      return url.hostname.replace(/^www\./, "");
                    } catch {
                      return user.user.link;
                    }
                  })()}
                </a>
              </div>
            )}

            <div className="flex items-center gap-1">
              <IoCalendarOutline className="w-4 h-4" />
              <span>Joined {memberSinceDate}</span>
            </div>
          </div>

          {/* Follow Info */}
          <div className="flex gap-2">
            <div className="flex gap-1 items-center">
              <span className="font-bold text-xs">
                {user?.user?.following?.length}
              </span>
              <span className="text-slate-500 text-xs">Following</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="font-bold text-xs">
                {user?.user?.followers?.length}
              </span>
              <span className="text-slate-500 text-xs">Followers</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-full border-b border-gray-700 mt-4">
          <div
            className={`flex justify-center flex-1 p-3 transition duration-300 relative cursor-pointer ${
              feedType === "posts" ? "text-white" : "text-slate-500"
            }`}
            onClick={() => setFeedType("posts")}
          >
            Posts
            {feedType === "posts" && (
              <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
            )}
          </div>

          <div
            className={`flex justify-center flex-1 p-3 transition duration-300 relative cursor-pointer ${
              feedType === "likes" ? "text-white" : "text-slate-500"
            }`}
            onClick={() => setFeedType("likes")}
          >
            Likes
            {feedType === "likes" && (
              <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
            )}
          </div>
        </div>

        {/* Posts */}
        <Posts
          username={username}
          userId={user?.user?._id}
          feedType={feedType}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
