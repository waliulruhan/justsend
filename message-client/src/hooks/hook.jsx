import {useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { notifyError, notifySuccess } from "../lib/Toasting";

const useErrors = (errors = []) => {
  useEffect(() => {
    errors.forEach(({ isError, error, fallback }) => {
      if (isError) {
        console.log(isError , error)
        if (fallback) fallback();
        else notifyError(error.response.data.message || "Something went wrong");
      }
    });
  }, [errors]);
};

const useAsyncMutation = (mutation) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  const executeMutation = async (toastMessage, ...args) => {
    setIsLoading(true);
    const toastId = toast.loading(toastMessage || "Updating data...");

    try {
      const res = await mutation.mutateAsync(...args);
      console.log(res);
      if (res.success) {
        notifySuccess(res?.message || "Updated data successfully", {
          id: toastId,
        });
        setData(res.data);
      } else {
        notifyError( "Something went wrong", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      notifyError(error?.response?.data?.message || "Something went wrong", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return [ executeMutation, isLoading, data ];
};




  function useSocketEvents(socket, handlers) {
    useEffect(() => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.on(event, handler);
      });

      return () => {
        Object.entries(handlers).forEach(([event, handler]) => {
          socket.off(event, handler);
        });
      };
    }, [socket, handlers]);
  }

  const useLazyLoadingTop = (
    containerRef,
    totalPages,
    page,
    setPage,
    newData,
    shouldReverse = false
  ) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
  
    const debounceTimer = useRef(null);
  
    const handleScroll = useCallback(() => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
  
      debounceTimer.current = setTimeout(() => {
        if (!containerRef.current) return;
  
        const { scrollTop } = containerRef.current;
        const scrolledToTop = scrollTop === 0;
  
        if (scrolledToTop && !loading && hasMore) {
          if (totalPages === page) return;
          setLoading(true);
          setPage((oldPage) => oldPage + 1);
        }
      }, 200);
    }, [totalPages, page, loading, hasMore]);
  
    useEffect(() => {
      const container = containerRef.current;
  
      if (container) container.addEventListener('scroll', handleScroll);
  
      return () => {
        if (container) container.removeEventListener('scroll', handleScroll);
      };
    }, [handleScroll]);
  
    useEffect(() => {
      if (newData && newData.length > 0) {
        setHasMore(page < totalPages);
  
        setData((oldData) => {
          const seen = new Set(oldData.map((i) => i._id));
          const newMessages = newData.filter((i) => !seen.has(i._id));
  
          if (shouldReverse) {
            return [...newMessages.reverse(), ...oldData];
          } else {
            return [...newMessages, ...oldData];
          }
        });
      }
  
      if (loading) {
        setLoading(false);
      }
    }, [newData, page, totalPages, shouldReverse, loading]);
  
    return { data, loading, hasMore, setData };
  };
  
  export {useSocketEvents ,useErrors , useAsyncMutation, useLazyLoadingTop};